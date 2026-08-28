import type { ErrorRequestHandler } from "express";

import { AppError, ValidationError } from "../utils/errors";

/**
 * Terminal error handler.
 *
 * Only errors thrown deliberately (AppError subclasses) have their message sent
 * to the client. Anything else is an unexpected failure whose text may carry
 * internals — Prisma echoes query fragments and column names, Firebase echoes
 * project config — so those are logged server-side and reported generically.
 */
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const body: { message: string; issues?: Record<string, string[]> } = {
      message: err.message,
    };

    if (err instanceof ValidationError && err.issues) {
      body.issues = err.issues;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Express's own middleware (notably express.json) rejects bad input with an
  // error carrying a 4xx status. That is a client mistake, so honour the status
  // instead of reporting our own 500 — but keep the message generic, since the
  // body-parser text varies by payload.
  const upstreamStatus = getUpstreamClientStatus(err);

  if (upstreamStatus) {
    res.status(upstreamStatus).json({ message: "Malformed request." });
    return;
  }

  // A handler may already have committed a status (e.g. 404 from notFound)
  // before failing; otherwise this is an unhandled 500.
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  console.error("Unhandled error:", err);

  res.status(statusCode).json({ message: "Internal server error" });
};

/** Reads the 4xx status Express attaches to body-parsing failures, if present. */
function getUpstreamClientStatus(err: unknown): number | null {
  if (typeof err !== "object" || err === null) {
    return null;
  }

  const candidate = err as { status?: unknown; statusCode?: unknown };
  const status = typeof candidate.status === "number" ? candidate.status : candidate.statusCode;

  return typeof status === "number" && status >= 400 && status < 500 ? status : null;
}
