import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  user: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), count: vi.fn() },
  project: { findUnique: vi.fn(), findMany: vi.fn(), delete: vi.fn(), count: vi.fn() },
  skill: { findMany: vi.fn(), groupBy: vi.fn(), aggregate: vi.fn(), count: vi.fn() },
  task: { findMany: vi.fn(), count: vi.fn() },
  roadmap: { findMany: vi.fn(), groupBy: vi.fn(), count: vi.fn() },
  feedback: { count: vi.fn() },
};

vi.mock("../lib/prisma", () => ({ prisma: prismaMock }));

const adminService = await import("./admin.service");
const { ForbiddenError, NotFoundError } = await import("../utils/errors");

const ADMIN = "admin-user-id";
const OTHER = "other-user-id";

function storedUser(overrides: Record<string, unknown> = {}) {
  return {
    id: OTHER,
    firebaseUid: "uid",
    email: "user@example.com",
    name: "Ada",
    imageUrl: null,
    targetRole: "Frontend Intern",
    preferredStack: ["React"],
    role: "USER",
    status: "ACTIVE",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    skills: [],
    projects: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findUnique.mockResolvedValue(storedUser());
  prismaMock.user.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
    Promise.resolve(storedUser(data)),
  );
  prismaMock.task.findMany.mockResolvedValue([]);
  prismaMock.roadmap.findMany.mockResolvedValue([]);
});

describe("self-lockout guardrails", () => {
  it("refuses to let an admin demote themselves", async () => {
    // The last admin demoting themselves would leave nobody able to promote
    // anyone back, with no route into these screens at all.
    await expect(adminService.updateUserRole(ADMIN, ADMIN, "USER")).rejects.toBeInstanceOf(
      ForbiddenError,
    );

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("refuses to let an admin deactivate themselves", async () => {
    // authMiddleware rejects INACTIVE accounts, so this locks you out on the
    // very next request.
    await expect(
      adminService.updateUserStatus(ADMIN, ADMIN, "INACTIVE"),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("allows an admin to re-affirm their own admin role", async () => {
    // Setting your own role to what it already is is not a lockout.
    await expect(adminService.updateUserRole(ADMIN, ADMIN, "ADMIN")).resolves.toBeDefined();
  });

  it("allows an admin to reactivate their own account", async () => {
    await expect(adminService.updateUserStatus(ADMIN, ADMIN, "ACTIVE")).resolves.toBeDefined();
  });

  it("still allows demoting a different admin", async () => {
    await expect(adminService.updateUserRole(ADMIN, OTHER, "USER")).resolves.toBeDefined();
    expect(prismaMock.user.update).toHaveBeenCalled();
  });

  it("still allows deactivating a different user", async () => {
    await expect(
      adminService.updateUserStatus(ADMIN, OTHER, "INACTIVE"),
    ).resolves.toBeDefined();
  });

  it("404s on a user that does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(adminService.updateUserRole(ADMIN, "missing", "ADMIN")).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe("getUsers", () => {
  beforeEach(() => {
    prismaMock.user.findMany.mockResolvedValue([storedUser()]);
  });

  it("lists every user when no search is given", async () => {
    await adminService.getUsers();

    expect(prismaMock.user.findMany.mock.calls[0][0].where).toBeUndefined();
  });

  it("searches name and email case-insensitively", async () => {
    await adminService.getUsers("ada");

    expect(prismaMock.user.findMany.mock.calls[0][0].where).toEqual({
      OR: [
        { name: { contains: "ada", mode: "insensitive" } },
        { email: { contains: "ada", mode: "insensitive" } },
      ],
    });
  });

  it("treats a whitespace-only search as no search", async () => {
    await adminService.getUsers("   ");

    expect(prismaMock.user.findMany.mock.calls[0][0].where).toBeUndefined();
  });

  it("attributes each user's tasks through their projects", async () => {
    // Task has no userId — ownership resolves via project.userId, and getting
    // that wrong would score every user off somebody else's tasks.
    prismaMock.user.findMany.mockResolvedValue([
      storedUser({ id: "u1", skills: [{ category: "Frontend", progress: 100 }], projects: [] }),
      storedUser({ id: "u2", skills: [{ category: "Frontend", progress: 100 }], projects: [] }),
    ]);
    prismaMock.task.findMany.mockResolvedValue([
      { status: "COMPLETED", project: { userId: "u1" } },
      { status: "TODO", project: { userId: "u2" } },
      { status: "TODO", project: { userId: "u2" } },
    ]);

    const [first, second] = await adminService.getUsers();

    // u1 completed everything it had; u2 completed nothing.
    expect(first.readinessScore).toBeGreaterThan(second.readinessScore);
  });

  it("counts roadmap follow-through toward each user's readiness score", async () => {
    // Roadmaps are fetched for the whole table in one query and grouped by
    // userId, so a mix-up here would score users off someone else's plan.
    prismaMock.user.findMany.mockResolvedValue([
      storedUser({ id: "u1" }),
      storedUser({ id: "u2" }),
    ]);
    prismaMock.roadmap.findMany.mockResolvedValue([
      {
        userId: "u1",
        completedWeeks: [1, 2, 3, 4],
        content: {
          title: "Plan",
          summary: "s",
          weeklyPlan: [1, 2, 3, 4].map((week) => ({
            week,
            focus: "f",
            objectives: ["o"],
          })),
          recommendedSkills: [{ name: "n", reason: "r" }],
          miniProjects: [{ title: "t", description: "d" }],
          milestones: [{ week: 1, title: "t" }],
          mistakesToAvoid: ["m"],
          nextSteps: ["n"],
        },
      },
    ]);

    const [first, second] = await adminService.getUsers();

    expect(first.readinessScore).toBeGreaterThan(second.readinessScore);
  });

  it("fetches roadmaps once rather than per user", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      storedUser({ id: "u1" }),
      storedUser({ id: "u2" }),
      storedUser({ id: "u3" }),
    ]);

    await adminService.getUsers();

    expect(prismaMock.roadmap.findMany).toHaveBeenCalledTimes(1);
  });

  it("fetches tasks once rather than per user", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      storedUser({ id: "u1" }),
      storedUser({ id: "u2" }),
      storedUser({ id: "u3" }),
    ]);

    await adminService.getUsers();

    expect(prismaMock.task.findMany).toHaveBeenCalledTimes(1);
  });

  it("lowercases role and status for the client", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      storedUser({ role: "ADMIN", status: "INACTIVE" }),
    ]);

    const [user] = await adminService.getUsers();

    expect(user.role).toBe("admin");
    expect(user.status).toBe("inactive");
  });
});

describe("getProjects", () => {
  beforeEach(() => {
    prismaMock.project.findMany.mockResolvedValue([]);
  });

  it("applies status and priority filters", async () => {
    await adminService.getProjects({ status: "IN_PROGRESS", priority: "HIGH" });

    expect(prismaMock.project.findMany.mock.calls[0][0].where).toEqual({
      status: "IN_PROGRESS",
      priority: "HIGH",
    });
  });

  it("leaves filters undefined when none are given, rather than matching nothing", async () => {
    await adminService.getProjects();

    expect(prismaMock.project.findMany.mock.calls[0][0].where).toEqual({
      status: undefined,
      priority: undefined,
    });
  });

  it("includes the owner so the table can attribute each project", async () => {
    prismaMock.project.findMany.mockResolvedValue([
      {
        id: "p1",
        title: "Portfolio",
        description: null,
        techStack: ["Next.js"],
        status: "IN_PROGRESS",
        priority: "HIGH",
        progress: 40,
        deadline: null,
        createdAt: new Date("2026-02-01"),
        user: { id: OTHER, name: "Ada", email: "ada@example.com" },
        _count: { tasks: 3 },
      },
    ]);

    const [project] = await adminService.getProjects();

    expect(project.ownerName).toBe("Ada");
    expect(project.taskCount).toBe(3);
    expect(project.status).toBe("in-progress");
    expect(project.deadline).toBe("");
  });
});

describe("deleteProject", () => {
  it("404s rather than silently succeeding on a missing project", async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(adminService.deleteProject("missing")).rejects.toBeInstanceOf(NotFoundError);
    expect(prismaMock.project.delete).not.toHaveBeenCalled();
  });

  it("is not owner-scoped — an admin removes any project", async () => {
    prismaMock.project.findUnique.mockResolvedValue({ id: "p1", userId: OTHER });

    await adminService.deleteProject("p1");

    expect(prismaMock.project.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });
});

describe("getSkillAnalytics", () => {
  it("reports zero rather than NaN on an empty platform", async () => {
    // _avg is null when there are no rows; passing that through would render
    // "NaN%" on the dashboard.
    prismaMock.skill.groupBy.mockResolvedValue([]);
    prismaMock.skill.aggregate.mockResolvedValue({ _avg: { progress: null } });
    prismaMock.skill.count.mockResolvedValue(0);

    const analytics = await adminService.getSkillAnalytics();

    expect(analytics.averageProgress).toBe(0);
    expect(analytics.totalSkills).toBe(0);
  });

  it("rounds averages and lowercases levels", async () => {
    prismaMock.skill.groupBy
      .mockResolvedValueOnce([{ name: "React", _count: { name: 4 }, _avg: { progress: 62.4 } }])
      .mockResolvedValueOnce([
        { category: "Frontend", _count: { category: 4 }, _avg: { progress: 62.4 } },
      ])
      .mockResolvedValueOnce([{ level: "BEGINNER", _count: { level: 2 } }]);
    prismaMock.skill.aggregate.mockResolvedValue({ _avg: { progress: 62.4 } });
    prismaMock.skill.count.mockResolvedValue(4);

    const analytics = await adminService.getSkillAnalytics();

    expect(analytics.mostAdded[0]).toEqual({ name: "React", count: 4, averageProgress: 62 });
    expect(analytics.byLevel[0].level).toBe("beginner");
  });
});

describe("getRoadmapAnalytics", () => {
  it("reports real user progress rather than a count of generated steps", async () => {
    prismaMock.roadmap.count.mockResolvedValue(1);
    prismaMock.roadmap.groupBy.mockResolvedValue([
      { targetRole: "Frontend Intern", _count: { targetRole: 1 } },
    ]);
    prismaMock.roadmap.findMany.mockResolvedValue([
      {
        id: "r1",
        goal: "Get an internship",
        targetRole: "Frontend Intern",
        duration: "8 weeks",
        completedWeeks: [1, 2, 3],
        createdAt: new Date("2026-08-01"),
        user: { id: OTHER, name: "Ada" },
      },
    ]);

    const analytics = await adminService.getRoadmapAnalytics();

    expect(analytics.totalGenerated).toBe(1);
    expect(analytics.recent[0].completedWeeks).toBe(3);
    expect(analytics.commonTargetRoles[0].count).toBe(1);
  });
});

describe("getPlatformStats", () => {
  it("counts active users separately from total users", async () => {
    prismaMock.user.count.mockResolvedValueOnce(10).mockResolvedValueOnce(7).mockResolvedValueOnce(2);
    prismaMock.project.count.mockResolvedValue(5);
    prismaMock.skill.count.mockResolvedValue(20);
    prismaMock.roadmap.count.mockResolvedValue(3);
    prismaMock.task.count.mockResolvedValue(12);
    prismaMock.feedback.count.mockResolvedValue(1);

    const stats = await adminService.getPlatformStats();

    expect(stats.users).toBe(10);
    expect(stats.activeUsers).toBe(7);
    expect(stats.admins).toBe(2);
  });
});
