import { Router } from "express";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcement.controller";
import { getAllFeedback, updateFeedbackStatus } from "../controllers/feedback.controller";
import * as announcementService from "../services/announcement.service";
import * as feedbackService from "../services/feedback.service";
import { validate } from "../middleware/validate.middleware";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "../validators/announcement.validator";
import { updateFeedbackStatusSchema } from "../validators/feedback.validator";
import {
  mockAdminUsers,
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
      announcements: await announcementService.getAnnouncements(),
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

router.get("/announcements", getAnnouncements);
router.post("/announcements", validate(createAnnouncementSchema), createAnnouncement);
router.put("/announcements/:id", validate(updateAnnouncementSchema), updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

export default router;
