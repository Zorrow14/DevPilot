import type { NextFunction, Request, Response } from "express";

import * as userService from "../services/user.service";
import { getAuthUserId } from "./helpers";

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
    next(error);
  }
}
