import { Router } from "express";

import { prisma } from "../lib/prisma";
import { calculateReadinessScore } from "../utils/calculateReadinessScore";
import {
  mockAnnouncements,
  mockRoadmaps,
} from "../data/mockData";

const router = Router();

function formatSkill(level: string) {
  return level.toLowerCase();
}

function formatProjectStatus(status: string) {
  return status.toLowerCase().replace("_", "-");
}

function formatTaskStatus(status: string) {
  return status === "COMPLETED" ? "done" : status.toLowerCase().replace("_", "-");
}

router.get("/stats", async (req, res, next) => {
  try {
    if (!req.user?.dbUserId) {
      res.status(401).json({ message: "Authenticated user is required." });
      return;
    }

    const [account, skills, projects, tasks] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: req.user.dbUserId } }),
      prisma.skill.findMany({
        where: { userId: req.user.dbUserId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: { userId: req.user.dbUserId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.findMany({
        where: {
          project: {
            userId: req.user.dbUserId,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const readiness = calculateReadinessScore({ skills, projects, tasks });

    res.json({
      user: {
        id: account.id,
        firebaseUid: account.firebaseUid,
        email: account.email,
        name: account.name,
        imageUrl: account.imageUrl,
        role: account.role.toLowerCase(),
        status: account.status.toLowerCase(),
        targetRole: account.targetRole ?? "",
        preferredStack: account.preferredStack,
        readinessScore: readiness.overall,
      },
      readiness,
      skills: skills.map((skill) => ({
        ...skill,
        level: formatSkill(skill.level),
        lastPracticed: "Today",
      })),
      projects: projects.map((project) => ({
        ...project,
        description: project.description ?? "",
        status: formatProjectStatus(project.status),
        priority: project.priority.toLowerCase(),
        deadline: project.deadline?.toISOString().slice(0, 10) ?? "",
      })),
      tasks: tasks.map((task) => ({
        ...task,
        description: task.description ?? "",
        status: formatTaskStatus(task.status),
        priority: task.priority.toLowerCase(),
        dueDate: task.dueDate?.toISOString().slice(0, 10) ?? "",
        completed: task.status === "COMPLETED",
      })),
      roadmaps: mockRoadmaps,
      announcements: mockAnnouncements,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
