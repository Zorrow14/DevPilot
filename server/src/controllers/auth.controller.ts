import type { NextFunction, Request, Response } from "express";

import { getUserById } from "../services/auth.service";

export async function syncUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.dbUserId) {
      res.status(401).json({ message: "Authenticated user is required." });
      return;
    }

    const user = await getUserById(req.user.dbUserId);
    res.json(user);
  } catch (error) {
    next(error);
  }
}
