import type { NextFunction, Request, Response } from "express";

import * as taskService from "../services/task.service";
import { getAuthUserId, getParam } from "./helpers";

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await taskService.updateTask(
      getAuthUserId(req),
      getParam(req, "id"),
      req.body,
    );
    res.json(task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.deleteTask(getAuthUserId(req), getParam(req, "id"));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
