import type { Request } from "express";

import { UnauthorizedError, ValidationError } from "../utils/errors";

/**
 * Shared controller helpers.
 *
 * Previously each controller carried its own copy of these, and each mapped
 * errors to status codes by substring-matching the message. Both now live here
 * so the HTTP contract is stated once — controllers simply `next(error)` and
 * the error middleware reads the typed status off it.
 */

export function getAuthUserId(req: Request) {
  if (!req.user?.dbUserId) {
    // Reaching a handler without req.user means the route was mounted without
    // authMiddleware — a wiring bug, not a client mistake.
    throw new UnauthorizedError("Authenticated user is required.");
  }

  return req.user.dbUserId;
}

export function getParam(req: Request, key: string) {
  const value = req.params[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new ValidationError(`${key} is required.`);
  }

  return value;
}
