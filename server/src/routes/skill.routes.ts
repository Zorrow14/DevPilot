import { Router } from "express";

import {
  createSkill,
  deleteSkill,
  getSkills,
  updateSkill,
} from "../controllers/skill.controller";

const router = Router();

router.get("/", getSkills);
router.post("/", createSkill);
router.put("/:id", updateSkill);
router.delete("/:id", deleteSkill);

export default router;
