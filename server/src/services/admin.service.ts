import type { Prisma, Project, Skill, User } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { getRoadmapActivityByUser, type RoadmapActivity } from "./roadmap.service";
import { calculateReadinessScore } from "../utils/calculateReadinessScore";
import { ForbiddenError, NotFoundError } from "../utils/errors";

/**
 * Platform-wide reads for the admin dashboard.
 *
 * Nothing here is user-scoped, which is safe only because every route that
 * reaches this module sits behind authMiddleware + requireAdmin in
 * index.routes.ts. Do not import it from a user-facing route.
 */

type UserWithWork = User & {
  skills: Pick<Skill, "category" | "progress">[];
  projects: Pick<Project, "status">[];
};

function formatAdminUser(
  user: UserWithWork & { taskStatuses?: string[]; roadmapActivity?: RoadmapActivity[] },
) {
  const readiness = calculateReadinessScore({
    skills: user.skills,
    projects: user.projects,
    tasks: (user.taskStatuses ?? []).map((status) => ({ status: status as never })),
    roadmaps: user.roadmapActivity ?? [],
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role.toLowerCase(),
    status: user.status.toLowerCase(),
    targetRole: user.targetRole ?? "",
    preferredStack: user.preferredStack,
    readinessScore: readiness.overall,
    skillCount: user.skills.length,
    projectCount: user.projects.length,
    createdAt: user.createdAt.toISOString().slice(0, 10),
  };
}

export type AdminUserView = ReturnType<typeof formatAdminUser>;

/**
 * Every user, with the readiness score the admin table shows.
 *
 * Tasks hang off projects rather than users, so they are fetched once and
 * grouped in memory — a per-user query would be one round trip per row.
 */
export async function getUsers(search?: string) {
  const trimmed = search?.trim();

  const where: Prisma.UserWhereInput | undefined = trimmed
    ? {
        OR: [
          { name: { contains: trimmed, mode: "insensitive" } },
          { email: { contains: trimmed, mode: "insensitive" } },
        ],
      }
    : undefined;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      skills: { select: { category: true, progress: true } },
      projects: { select: { id: true, status: true } },
    },
  });

  const [tasks, roadmapsByUser] = await Promise.all([
    prisma.task.findMany({
      select: { status: true, project: { select: { userId: true } } },
    }),
    getRoadmapActivityByUser(),
  ]);

  const tasksByUser = new Map<string, string[]>();

  for (const task of tasks) {
    const userId = task.project.userId;
    const existing = tasksByUser.get(userId);

    if (existing) {
      existing.push(task.status);
    } else {
      tasksByUser.set(userId, [task.status]);
    }
  }

  return users.map((user) =>
    formatAdminUser({
      ...user,
      taskStatuses: tasksByUser.get(user.id) ?? [],
      roadmapActivity: roadmapsByUser.get(user.id) ?? [],
    }),
  );
}

export async function updateUserRole(actingAdminId: string, userId: string, role: "USER" | "ADMIN") {
  // An admin demoting themselves could remove the last route back into these
  // screens. Blocking self-demotion means losing admin access always takes a
  // second person, which is the point.
  if (actingAdminId === userId && role !== "ADMIN") {
    throw new ForbiddenError("You cannot remove your own administrator access.");
  }

  await findUser(userId);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    include: {
      skills: { select: { category: true, progress: true } },
      projects: { select: { status: true } },
    },
  });

  return formatAdminUser(user);
}

export async function updateUserStatus(
  actingAdminId: string,
  userId: string,
  status: "ACTIVE" | "INACTIVE",
) {
  // Deactivating yourself is locking yourself out — authMiddleware rejects
  // INACTIVE accounts on the very next request.
  if (actingAdminId === userId && status === "INACTIVE") {
    throw new ForbiddenError("You cannot deactivate your own account.");
  }

  await findUser(userId);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
    include: {
      skills: { select: { category: true, progress: true } },
      projects: { select: { status: true } },
    },
  });

  return formatAdminUser(user);
}

async function findUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError("User");
  }

  return user;
}

/** Every project with its owner, for the monitoring table. */
export async function getProjects(filters: { status?: string; priority?: string } = {}) {
  const projects = await prisma.project.findMany({
    where: {
      status: filters.status as never,
      priority: filters.priority as never,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { tasks: true } },
    },
  });

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description ?? "",
    techStack: project.techStack,
    status: project.status.toLowerCase().replace("_", "-"),
    priority: project.priority.toLowerCase(),
    progress: project.progress,
    deadline: project.deadline?.toISOString().slice(0, 10) ?? "",
    taskCount: project._count.tasks,
    ownerId: project.user.id,
    ownerName: project.user.name,
    ownerEmail: project.user.email,
    createdAt: project.createdAt.toISOString().slice(0, 10),
  }));
}

export async function deleteProject(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new NotFoundError("Project");
  }

  // Tasks cascade from Project, so this does not orphan rows.
  await prisma.project.delete({ where: { id: projectId } });
}

/**
 * Skill trends across the platform.
 *
 * Grouped in SQL rather than fetching every row and reducing in Node — this is
 * the one place that reads every user's data at once, so it is also the first
 * place that would fall over as the table grows.
 */
export async function getSkillAnalytics() {
  const [byName, byCategory, byLevel, aggregate, total] = await Promise.all([
    prisma.skill.groupBy({
      by: ["name"],
      _count: { name: true },
      _avg: { progress: true },
      orderBy: { _count: { name: "desc" } },
      take: 10,
    }),
    prisma.skill.groupBy({
      by: ["category"],
      _count: { category: true },
      _avg: { progress: true },
      orderBy: { _count: { category: "desc" } },
    }),
    prisma.skill.groupBy({
      by: ["level"],
      _count: { level: true },
    }),
    prisma.skill.aggregate({ _avg: { progress: true } }),
    prisma.skill.count(),
  ]);

  return {
    totalSkills: total,
    averageProgress: Math.round(aggregate._avg.progress ?? 0),
    mostAdded: byName.map((row) => ({
      name: row.name,
      count: row._count.name,
      averageProgress: Math.round(row._avg.progress ?? 0),
    })),
    byCategory: byCategory.map((row) => ({
      category: row.category,
      count: row._count.category,
      averageProgress: Math.round(row._avg.progress ?? 0),
    })),
    byLevel: byLevel.map((row) => ({
      level: row.level.toLowerCase(),
      count: row._count.level,
    })),
  };
}

/** Roadmap generation activity. */
export async function getRoadmapAnalytics() {
  const [total, byGoal, recent] = await Promise.all([
    prisma.roadmap.count(),
    prisma.roadmap.groupBy({
      by: ["targetRole"],
      _count: { targetRole: true },
      orderBy: { _count: { targetRole: "desc" } },
      take: 10,
    }),
    prisma.roadmap.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  return {
    totalGenerated: total,
    commonTargetRoles: byGoal.map((row) => ({
      targetRole: row.targetRole,
      count: row._count.targetRole,
    })),
    recent: recent.map((roadmap) => ({
      id: roadmap.id,
      goal: roadmap.goal,
      targetRole: roadmap.targetRole,
      duration: roadmap.duration,
      // Progress the user has actually made, rather than a number derived from
      // how many steps the generator happened to produce.
      completedWeeks: roadmap.completedWeeks.length,
      ownerName: roadmap.user.name,
      createdAt: roadmap.createdAt.toISOString().slice(0, 10),
    })),
  };
}

/** Headline counts for the overview cards. */
export async function getPlatformStats() {
  const [users, activeUsers, admins, projects, completedProjects, skills, roadmaps, tasks, completedTasks, openFeedback] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.skill.count(),
      prisma.roadmap.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: "COMPLETED" } }),
      prisma.feedback.count({ where: { status: { in: ["NEW", "IN_REVIEW"] } } }),
    ]);

  return {
    users,
    activeUsers,
    admins,
    projects,
    completedProjects,
    skills,
    roadmaps,
    tasks,
    completedTasks,
    openFeedback,
  };
}

/** Skills across all users, for the raw analytics listing. */
export async function getSkills() {
  const skills = await prisma.skill.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true } } },
  });

  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    level: skill.level.toLowerCase(),
    progress: skill.progress,
    ownerName: skill.user.name,
    lastPracticed: skill.lastPracticedAt?.toISOString().slice(0, 10) ?? "",
  }));
}
