import { Router } from "express";

import {
  deleteRoadmap,
  generateRoadmap,
  getRoadmaps,
  updateRoadmapProgress,
} from "../controllers/roadmap.controller";
import { roadmapGenerationLimiter } from "../middleware/rateLimit.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  generateRoadmapSchema,
  roadmapProgressSchema,
} from "../validators/roadmap.validator";

const router = Router();

router.get("/", getRoadmaps);
// The limiter runs before validation so a flood of malformed payloads is
// throttled too — rejecting them is cheap, but not free.
router.post(
  "/generate",
  roadmapGenerationLimiter,
  validate(generateRoadmapSchema),
  generateRoadmap,
);
router.patch("/:id/progress", validate(roadmapProgressSchema), updateRoadmapProgress);
router.delete("/:id", deleteRoadmap);

export default router;
