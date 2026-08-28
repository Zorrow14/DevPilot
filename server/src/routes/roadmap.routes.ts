import { Router } from "express";

import {
  deleteRoadmap,
  generateRoadmap,
  getRoadmaps,
  updateRoadmapProgress,
} from "../controllers/roadmap.controller";
import { validate } from "../middleware/validate.middleware";
import {
  generateRoadmapSchema,
  roadmapProgressSchema,
} from "../validators/roadmap.validator";

const router = Router();

router.get("/", getRoadmaps);
router.post("/generate", validate(generateRoadmapSchema), generateRoadmap);
router.patch("/:id/progress", validate(roadmapProgressSchema), updateRoadmapProgress);
router.delete("/:id", deleteRoadmap);

export default router;
