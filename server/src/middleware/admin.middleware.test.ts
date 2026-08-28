import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";

import { requireAdmin } from "./admin.middleware";

function createResponse() {
  const res = {
    statusCode: 0,
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

  return res as unknown as Response & { statusCode: number; body: unknown };
}

function createRequest(user?: Partial<NonNullable<Request["user"]>>) {
  return {
    user: user
      ? {
          dbUserId: "user-1",
          firebaseUid: "firebase-1",
          email: "dev@example.com",
          role: "USER",
          status: "ACTIVE",
          ...user,
        }
      : undefined,
  } as Request;
}

describe("requireAdmin", () => {
  it("passes an ADMIN through", () => {
    const next = vi.fn() as unknown as NextFunction;
    const res = createResponse();

    requireAdmin(createRequest({ role: "ADMIN" }), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(0);
  });

  it("rejects a signed-in non-admin with 403", () => {
    const next = vi.fn() as unknown as NextFunction;
    const res = createResponse();

    requireAdmin(createRequest({ role: "USER" }), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it("rejects an unauthenticated request with 401", () => {
    // Guards against being mounted before authMiddleware, where req.user is
    // absent — that must not read as "no role, therefore allow".
    const next = vi.fn() as unknown as NextFunction;
    const res = createResponse();

    requireAdmin(createRequest(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
});
