import express from "express";
import type { Request, Response, NextFunction } from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { roadmapGenerationLimiter } from "./rateLimit.middleware";

/**
 * Behavioural test against a real Express app, in the spirit of
 * errorContract.test.ts: the limiter's value is entirely in what a client
 * receives on the eleventh call, which a unit test of its options cannot show.
 *
 * Each test uses its own user id because the limiter's store is in-memory and
 * shared across this file — distinct ids keep the buckets from colliding.
 */

let server: Server;
let baseUrl: string;

/** Stands in for authMiddleware, which is what populates req.user in the app. */
function asUser(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header("x-test-user");

  if (userId) {
    req.user = { dbUserId: userId } as NonNullable<Request["user"]>;
  }

  next();
}

beforeAll(async () => {
  const app = express();
  app.set("trust proxy", 1);
  app.use(asUser);
  app.post("/generate", roadmapGenerationLimiter, (_req, res) => {
    res.status(201).json({ ok: true });
  });

  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

function generate(userId: string) {
  return fetch(`${baseUrl}/generate`, {
    method: "POST",
    headers: { "x-test-user": userId },
  });
}

describe("roadmapGenerationLimiter", () => {
  it("allows a normal run of generations", async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await generate("steady-user");
      expect(response.status).toBe(201);
    }
  });

  it("answers 429 once the hourly limit is spent", async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await generate("heavy-user");
    }

    const blocked = await generate("heavy-user");

    expect(blocked.status).toBe(429);
    await expect(blocked.json()).resolves.toEqual({
      message: "Roadmap generation limit reached. Please try again in an hour.",
    });
  });

  // The reason the key is the account and not the IP: every request in this
  // test arrives from 127.0.0.1, so an IP-keyed limiter would have throttled
  // the second user along with the first.
  it("counts each account separately rather than lumping them by address", async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await generate("noisy-user");
    }

    expect((await generate("noisy-user")).status).toBe(429);
    expect((await generate("quiet-user")).status).toBe(201);
  });

  it("advertises the limit in draft-7 RateLimit headers", async () => {
    const response = await generate("header-user");

    expect(response.headers.get("ratelimit")).toContain("limit=10");
    // The legacy X-RateLimit-* family is disabled in favour of the standard one.
    expect(response.headers.get("x-ratelimit-limit")).toBeNull();
  });
});
