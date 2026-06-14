import { Router } from "express";

import {
  mockAdminUsers,
  mockAnnouncements,
  mockFeedback,
  mockProjects,
  mockRoadmaps,
  mockSkills,
} from "../data/mockData";

const router = Router();

router.get("/overview", (_req, res) => {
  res.json({
    users: mockAdminUsers,
    projects: mockProjects,
    skills: mockSkills,
    roadmaps: mockRoadmaps,
    feedback: mockFeedback,
    announcements: mockAnnouncements,
  });
});

router.get("/users", (_req, res) => {
  res.json(mockAdminUsers);
});

router.get("/projects", (_req, res) => {
  res.json(mockProjects);
});

router.get("/skills", (_req, res) => {
  res.json(mockSkills);
});

router.get("/roadmaps", (_req, res) => {
  res.json(mockRoadmaps);
});

router.get("/feedback", (_req, res) => {
  res.json(mockFeedback);
});

router.get("/announcements", (_req, res) => {
  res.json(mockAnnouncements);
});

export default router;
