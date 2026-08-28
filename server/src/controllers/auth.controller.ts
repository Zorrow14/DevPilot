import type { NextFunction, Request, Response } from "express";

import { getProfile } from "../services/user.service";
import { getAuthUserId } from "./helpers";

export async function syncUser(req: Request, res: Response, next: NextFunction) {
  try {
    // Same serializer as GET /users/me — the two return the same resource, so
    // they must not disagree about how role and status are spelled.
    const user = await getProfile(getAuthUserId(req));
    res.json(user);
  } catch (error) {
    next(error);
  }
}
