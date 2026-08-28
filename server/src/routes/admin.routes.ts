import { Router } from "express";

import { getAllFeedback, updateFeedbackStatus } from "../controllers/feedback.controller";
import * as feedbackService from "../services/feedback.service";
import { validate } from "../middleware/validate.middleware";
import { updateFeedbackStatusSchema } from "../validators/feedback.validator";
import {
  mockAdminUsers,
  mockAnnouncements,
  mockProjects,
  mockRoadmaps,
  mockSkills,
} from "../data/mockData";

const router = Router();

router.get("/overview", async (_req, res, next) => {
  try {
    res.json({
      users: mockAdminUsers,
      projects: mockProjects,
      skills: mockSkills,
      roadmaps: mockRoadmaps,
      feedback: await feedbackService.getAllFeedback(),
      announcements: mockAnnouncements,
    });
  } catch (error) {
    next(error);
  }
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

router.get("/feedback", getAllFeedback);
router.patch(
  "/feedback/:id/status",
  validate(updateFeedbackStatusSchema),
  updateFeedbackStatus,
);

router.get("/announcements", (_req, res) => {
  res.json(mockAnnouncements);
});

export default router;
