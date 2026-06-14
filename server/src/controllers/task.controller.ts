import type { NextFunction, Request, Response } from "express";

import * as taskService from "../services/task.service";

function getTaskId(req: Request) {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new Error("Task id is required.");
  }

  return id;
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

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const task = await taskService.updateTask(getTaskId(req), req.body);
    res.json(task);
  } catch (error) {
    handleControllerError(error, res, next);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await taskService.deleteTask(getTaskId(req));
    res.status(204).send();
  } catch (error) {
    handleControllerError(error, res, next);
  }
}
