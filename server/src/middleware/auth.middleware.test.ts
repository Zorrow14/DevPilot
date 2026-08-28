import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyIdToken = vi.fn();
const syncFirebaseUser = vi.fn();

// Mocked at the module boundary so no test ever needs Firebase credentials or a
// live Postgres connection.
vi.mock("../config/firebaseAdmin", () => ({
  getFirebaseAuth: () => ({ verifyIdToken }),
}));

vi.mock("../services/auth.service", () => ({
  getFirebaseUserInfo: (token: { uid: string; email: string }) => ({
    firebaseUid: token.uid,
    email: token.email,
  }),
  syncFirebaseUser: (...args: unknown[]) => syncFirebaseUser(...args),
}));

const { authMiddleware } = await import("./auth.middleware");

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

function createRequest(authorization?: string) {
  return {
    header: (name: string) => (name === "Authorization" ? authorization : undefined),
  } as Request;
}

const activeUser = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "dev@example.com",
  name: "Dev",
  imageUrl: null,
  role: "USER",
  status: "ACTIVE",
};

describe("authMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyIdToken.mockResolvedValue({ uid: "firebase-1", email: "dev@example.com" });
    syncFirebaseUser.mockResolvedValue(activeUser);
  });

  it("populates req.user and continues for an active account", async () => {
    const req = createRequest("Bearer good-token");
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toMatchObject({
      dbUserId: "user-1",
      email: "dev@example.com",
      role: "USER",
      status: "ACTIVE",
    });
  });

  it("rejects a deactivated account with 403 and never populates req.user", async () => {
    // The Firebase token stays valid after deactivation, so Postgres status is
    // the only thing that can lock a suspended account out.
    syncFirebaseUser.mockResolvedValue({ ...activeUser, status: "INACTIVE" });

    const req = createRequest("Bearer good-token");
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(req.user).toBeUndefined();
  });

  it("rejects a missing Authorization header with 401", async () => {
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    await authMiddleware(createRequest(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it("rejects a header that is not a Bearer token with 401", async () => {
    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    await authMiddleware(createRequest("Basic abc123"), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it("rejects an invalid or expired token with 401", async () => {
    verifyIdToken.mockRejectedValue(new Error("token expired"));

    const res = createResponse();
    const next = vi.fn() as unknown as NextFunction;

    await authMiddleware(createRequest("Bearer stale-token"), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
});
