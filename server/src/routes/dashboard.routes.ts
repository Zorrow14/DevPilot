import { Router } from "express";

import {
  mockAnnouncements,
  mockProjects,
  mockRoadmaps,
  mockSkills,
  mockTasks,
  mockUser,
} from "../data/mockData";

const router = Router();

router.get("/stats", (_req, res) => {
  res.json({
    user: mockUser,
    skills: mockSkills,
    projects: mockProjects,
    tasks: mockTasks,
    roadmaps: mockRoadmaps,
    announcements: mockAnnouncements,
  });
});

export default router;
