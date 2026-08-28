import { Router } from "express";

import {
  createProject,
  createProjectTask,
  deleteProject,
  getProject,
  getProjects,
  getProjectTasks,
  updateProject,
} from "../controllers/project.controller";
import { validate } from "../middleware/validate.middleware";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator";
import { createTaskSchema } from "../validators/task.validator";

const router = Router();

router.get("/", getProjects);
router.post("/", validate(createProjectSchema), createProject);
router.get("/:id", getProject);
router.put("/:id", validate(updateProjectSchema), updateProject);
router.delete("/:id", deleteProject);
router.get("/:projectId/tasks", getProjectTasks);
router.post("/:projectId/tasks", validate(createTaskSchema), createProjectTask);

export default router;
