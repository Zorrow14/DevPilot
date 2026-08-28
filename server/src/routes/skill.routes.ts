import { Router } from "express";

import {
  createSkill,
  deleteSkill,
  getSkills,
  updateSkill,
} from "../controllers/skill.controller";
import { validate } from "../middleware/validate.middleware";
import { createSkillSchema, updateSkillSchema } from "../validators/skill.validator";

const router = Router();

router.get("/", getSkills);
router.post("/", validate(createSkillSchema), createSkill);
router.put("/:id", validate(updateSkillSchema), updateSkill);
router.delete("/:id", deleteSkill);

export default router;
