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

const router = Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.get("/:projectId/tasks", getProjectTasks);
router.post("/:projectId/tasks", createProjectTask);

export default router;
