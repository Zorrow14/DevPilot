import type { NextFunction, Request, Response } from "express";

import * as projectService from "../services/project.service";
import * as taskService from "../services/task.service";
import { getAuthUserId, getParam } from "./helpers";

export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectService.getProjects(getAuthUserId(req));
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject(getAuthUserId(req), req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProject(getAuthUserId(req), getParam(req, "id"));
    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(
      getAuthUserId(req),
      getParam(req, "id"),
      req.body,
    );
    res.json(project);
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(getAuthUserId(req), getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getProjectTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await taskService.getProjectTasks(
      getAuthUserId(req),
      getParam(req, "projectId"),
    );
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createProjectTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.createTask(
      getAuthUserId(req),
      getParam(req, "projectId"),
      req.body,
    );
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}
