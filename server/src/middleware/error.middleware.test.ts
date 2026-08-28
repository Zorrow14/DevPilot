import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { errorMiddleware } from "./error.middleware";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/errors";

function createResponse(initialStatus = 200) {
  const res = {
    statusCode: initialStatus,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return res as unknown as Response & { statusCode: number; body: { message: string; issues?: unknown } };
}

const req = {} as Request;
const next = (() => {}) as NextFunction;

describe("errorMiddleware", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it.each([
    [new NotFoundError("Skill"), 404, "Skill not found."],
    [new ValidationError("Skill progress must be an integer between 0 and 100."), 400, "Skill progress must be an integer between 0 and 100."],
    [new UnauthorizedError(), 401, "Authentication is required."],
    [new ForbiddenError(), 403, "You do not have access to this resource."],
  ])("maps %s to its declared status", (error, status, message) => {
    const res = createResponse();

    errorMiddleware(error, req, res, next);

    expect(res.statusCode).toBe(status);
    expect(res.body.message).toBe(message);
  });

  it("includes field issues on a validation error", () => {
    const res = createResponse();
    const issues = { progress: ["Skill progress must be an integer between 0 and 100."] };

    errorMiddleware(new ValidationError("bad", issues), req, res, next);

    expect(res.body.issues).toEqual(issues);
  });

  it("does not leak an unexpected error's message", () => {
    // Prisma echoes query fragments and column names in its messages; those
    // must never reach a client.
    const res = createResponse();
    const leaky = new Error(
      'Invalid `prisma.user.findUnique()` invocation: column "secret_column" does not exist',
    );

    errorMiddleware(leaky, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
    expect(JSON.stringify(res.body)).not.toContain("secret_column");
  });

  it("logs unexpected errors server-side rather than swallowing them", () => {
    const res = createResponse();
    const boom = new Error("boom");

    errorMiddleware(boom, req, res, next);

    expect(console.error).toHaveBeenCalledWith("Unhandled error:", boom);
  });

  it("keeps an already-committed error status instead of overwriting it with 500", () => {
    const res = createResponse(404);

    errorMiddleware(new Error("late failure"), req, res, next);

    expect(res.statusCode).toBe(404);
  });

  it("uses 500 when the response is still at its default 200", () => {
    const res = createResponse(200);

    errorMiddleware(new Error("boom"), req, res, next);

    expect(res.statusCode).toBe(500);
  });
});
