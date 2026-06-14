import type { NextFunction, Request, Response } from "express";

import * as projectService from "../services/project.service";
import * as taskService from "../services/task.service";

function getParam(req: Request, key: string) {
  const value = req.params[key];

  if (typeof value !== "string") {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function handleControllerError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof Error && error.message.includes("not found")) {
    res.status(404).json({ message: error.message });
    return;
  }

  if (error instanceof Error && error.message.includes("required")) {
    res.status(400).json({ message: error.message });
    return;
  }

  next(error);
}

export async function getProjects(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const projects = await projectService.getProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    handleControllerError(error, res, next);
  }
}

export async function getProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await projectService.getProject(getParam(req, "id"));
    res.json(project);
  } catch (error) {
    handleControllerError(error, res, next);
  }
}

export async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const project = await projectService.updateProject(getParam(req, "id"), req.body);
    res.json(project);
  } catch (error) {
    handleControllerError(error, res, next);
  }
}

export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await projectService.deleteProject(getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    handleControllerError(error, res, next);
  }
}

export async function getProjectTasks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tasks = await taskService.getProjectTasks(getParam(req, "projectId"));
    res.json(tasks);
  } catch (error) {
    handleControllerError(error, res, next);
  }
}

export async function createProjectTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await taskService.createTask(getParam(req, "projectId"), req.body);
    res.status(201).json(task);
  } catch (error) {
    handleControllerError(error, res, next);
  }
}
