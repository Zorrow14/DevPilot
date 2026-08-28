import { Router } from "express";

import {
  deleteProject,
  getOverview,
  getProjects,
  getRoadmaps,
  getSkillAnalytics,
  getSkills,
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../controllers/admin.controller";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcement.controller";
import { getAllFeedback, updateFeedbackStatus } from "../controllers/feedback.controller";
import { validate } from "../middleware/validate.middleware";
import {
  adminProjectQuerySchema,
  adminUserQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../validators/admin.validator";
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "../validators/announcement.validator";
import { updateFeedbackStatusSchema } from "../validators/feedback.validator";

/**
 * Every route here is mounted behind authMiddleware + requireAdmin in
 * index.routes.ts. None of the handlers re-check the role, so that mount is
 * load-bearing — see admin.middleware.test.ts.
 */
const router = Router();

router.get("/overview", getOverview);

router.get("/users", validate(adminUserQuerySchema, "query"), getUsers);
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);
router.patch("/users/:id/status", validate(updateUserStatusSchema), updateUserStatus);

router.get("/projects", validate(adminProjectQuerySchema, "query"), getProjects);
router.delete("/projects/:id", deleteProject);

router.get("/skills", getSkills);
router.get("/skills/analytics", getSkillAnalytics);

router.get("/roadmaps", getRoadmaps);

router.get("/feedback", getAllFeedback);
router.patch("/feedback/:id/status", validate(updateFeedbackStatusSchema), updateFeedbackStatus);

router.get("/announcements", getAnnouncements);
router.post("/announcements", validate(createAnnouncementSchema), createAnnouncement);
router.put("/announcements/:id", validate(updateAnnouncementSchema), updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

export default router;
