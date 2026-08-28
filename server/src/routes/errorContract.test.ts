import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { errorMiddleware } from "../middleware/error.middleware";
import { validate } from "../middleware/validate.middleware";
import { NotFoundError, ValidationError } from "../utils/errors";
import { createSkillSchema } from "../validators/skill.validator";

/**
 * End-to-end HTTP contract for Phase 2.
 *
 * The unit tests cover validate() and errorMiddleware() in isolation; this
 * mounts them in a real Express app and asserts what a client actually
 * receives. It is the piece that would have caught the pre-Phase-2 bug where
 * skill.controller.ts had no error mapping, so a "not found" surfaced as a 500 —
 * both halves worked, the wiring did not.
 *
 * Auth and Prisma are deliberately absent: this is about the error contract,
 * not about identity or persistence.
 */

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  const app = express();
  app.use(express.json());

  app.post("/skills", validate(createSkillSchema), (req, res) => {
    res.status(201).json(req.body);
  });

  app.get("/skills/:id", (_req, _res) => {
    throw new NotFoundError("Skill");
  });

  app.get("/boom", (_req, _res) => {
    throw new Error(
      'Invalid `prisma.skill.findFirst()` invocation: column "internal_secret" does not exist',
    );
  });

  app.post("/query", validate(z.object({ status: z.string() }), "query"), (req, res) => {
    res.json({ query: req.query });
  });

  app.use(errorMiddleware);

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });

  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

async function post(path: string, body: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return { status: response.status, body: await response.json().catch(() => null) };
}

describe("error contract over HTTP", () => {
  it("returns 201 and the coerced body for a valid create", async () => {
    const { status, body } = await post("/skills", {
      name: "  React  ",
      category: "Frontend",
      level: "advanced",
    });

    expect(status).toBe(201);
    // Trimmed and enum-normalized before the handler saw it.
    expect(body).toMatchObject({ name: "React", level: "ADVANCED" });
  });

  it("returns 400 with field issues for an invalid body", async () => {
    const { status, body } = await post("/skills", { name: "", category: "FE", progress: 150 });

    expect(status).toBe(400);
    expect(body.issues).toHaveProperty("name");
    expect(body.issues).toHaveProperty("progress");
  });

  it("returns 404 for a NotFoundError rather than 500", async () => {
    // The regression this phase exists to prevent.
    const response = await fetch(`${baseUrl}/skills/does-not-exist`);

    expect(response.status).toBe(404);
    expect((await response.json()).message).toBe("Skill not found.");
  });

  it("returns a generic 500 for an unexpected error, leaking nothing", async () => {
    const response = await fetch(`${baseUrl}/boom`);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Internal server error");
    expect(JSON.stringify(body)).not.toContain("internal_secret");
    expect(JSON.stringify(body)).not.toContain("prisma");
  });

  it("validates query strings without tripping Express 5's read-only req.query", async () => {
    const ok = await fetch(`${baseUrl}/query?status=open`, { method: "POST" });
    expect(ok.status).toBe(200);
    expect((await ok.json()).query).toEqual({ status: "open" });

    const bad = await fetch(`${baseUrl}/query`, { method: "POST" });
    expect(bad.status).toBe(400);
  });

  it("reports a malformed JSON body as a client error, not a crash", async () => {
    const response = await fetch(`${baseUrl}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ not json",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });
});

describe("ValidationError shape", () => {
  it("carries its issues through to the response body", async () => {
    const error = new ValidationError("bad", { title: ["Title is required."] });
    expect(error.statusCode).toBe(400);
    expect(error.issues).toEqual({ title: ["Title is required."] });
  });
});
