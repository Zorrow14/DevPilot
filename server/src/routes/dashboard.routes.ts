import { Router } from "express";

import { prisma } from "../lib/prisma";
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

    const [skills, projects, tasks] = await Promise.all([
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

    res.json({
      user: {
        id: req.user.dbUserId,
        firebaseUid: req.user.firebaseUid,
        email: req.user.email,
        name: req.user.name ?? req.user.email,
        imageUrl: req.user.picture,
        role: req.user.role.toLowerCase(),
        status: req.user.status.toLowerCase(),
        targetRole: "Frontend Developer Intern",
        preferredStack: [],
        readinessScore: 0,
      },
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
