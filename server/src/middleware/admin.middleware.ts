import type { NextFunction, Request, Response } from "express";

/**
 * Gates a route to ADMIN accounts. Must be mounted *after* `authMiddleware`,
 * which is what populates `req.user` (including the role read here) from the
 * verified Firebase token and the synced Postgres row.
 *
 * The role comes from Postgres rather than a Firebase custom claim, so it takes
 * effect on the requester's next call — there is no token to re-mint after an
 * admin changes someone's role.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ message: "Authentication is required." });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({ message: "Administrator access is required." });
    return;
  }

  next();
}
