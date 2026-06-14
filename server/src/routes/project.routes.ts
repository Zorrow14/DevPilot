import { Router } from "express";

import { mockProjects, mockTasks } from "../data/mockData";

const router = Router();

router.get("/", (_req, res) => {
  res.json(mockProjects);
});

router.get("/:id", (req, res) => {
  const project = mockProjects.find((item) => item.id === req.params.id);

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  res.json(project);
});

router.get("/:projectId/tasks", (req, res) => {
  const tasks = mockTasks.filter((item) => item.projectId === req.params.projectId);

  res.json(tasks);
});

export default router;
