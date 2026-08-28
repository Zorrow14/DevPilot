import type { NextFunction, Request, Response } from "express";

import { getUserById } from "../services/auth.service";
import { getAuthUserId } from "./helpers";

export async function syncUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserById(getAuthUserId(req));
    res.json(user);
  } catch (error) {
    next(error);
  }
}
