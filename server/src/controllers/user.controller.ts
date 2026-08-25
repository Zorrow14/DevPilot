import type { NextFunction, Request, Response } from "express";

import * as userService from "../services/user.service";

function getAuthUserId(req: Request) {
  if (!req.user?.dbUserId) {
    throw new Error("Authenticated user is required.");
  }

  return req.user.dbUserId;
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await userService.getProfile(getAuthUserId(req)));
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.updateProfile(getAuthUserId(req), req.body);
    res.json(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes("required")) {
      res.status(400).json({ message: error.message });
      return;
    }

    if (error instanceof Error && error.message.includes("must be")) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}
