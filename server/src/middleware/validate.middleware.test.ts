import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { validate } from "./validate.middleware";
import { ValidationError } from "../utils/errors";

const res = {} as Response;

function runValidate(schema: z.ZodType, req: Partial<Request>, part: "body" | "params" | "query" = "body") {
  const next = vi.fn() as unknown as NextFunction & { mock: { calls: unknown[][] } };
  validate(schema, part)(req as Request, res, next);
  return { next, error: next.mock.calls[0]?.[0] };
}

describe("validate", () => {
  const schema = z.object({
    title: z.string().min(1, "Title is required."),
    progress: z.number().int().max(100, "Too large."),
  });

  it("calls next with no argument when the payload is valid", () => {
    const { next, error } = runValidate(schema, { body: { title: "Build", progress: 40 } });

    expect(next).toHaveBeenCalledOnce();
    expect(error).toBeUndefined();
  });

  it("replaces the request part with the parsed result", () => {
    // Downstream handlers should receive coerced values, not raw input.
    const coercing = z.object({ tags: z.array(z.string()).transform((t) => t.map((x) => x.trim())) });
    const req: Partial<Request> = { body: { tags: ["  react  "] } };

    runValidate(coercing, req);

    expect(req.body).toEqual({ tags: ["react"] });
  });

  it("forwards a ValidationError with field-keyed issues", () => {
    const { error } = runValidate(schema, { body: { title: "", progress: 500 } });

    expect(error).toBeInstanceOf(ValidationError);
    const validationError = error as ValidationError;
    expect(validationError.statusCode).toBe(400);
    expect(validationError.issues).toMatchObject({
      title: ["Title is required."],
      progress: ["Too large."],
    });
  });

  it("summarises using the first failing field's message", () => {
    const { error } = runValidate(schema, { body: { title: "", progress: 10 } });

    expect((error as ValidationError).message).toBe("Title is required.");
  });

  it("groups a top-level failure under the request part it came from", () => {
    // e.g. a JSON body that parsed to a string — the issue has an empty path.
    const { error } = runValidate(schema, { body: "not-an-object" });

    expect((error as ValidationError).issues).toHaveProperty("body");
  });

  it("validates params as well as body", () => {
    const paramSchema = z.object({ id: z.string().min(1, "A resource id is required.") });

    const { error } = runValidate(paramSchema, { params: { id: "" } }, "params");

    expect((error as ValidationError).issues).toMatchObject({
      id: ["A resource id is required."],
    });
  });

  it("assigns parsed query without tripping Express 5's getter-only req.query", () => {
    // Express 5 exposes req.query through a getter with no setter, so plain
    // assignment throws; the middleware must use defineProperty.
    const querySchema = z.object({ status: z.string() });
    const req = { body: {}, params: {} } as Partial<Request>;
    Object.defineProperty(req, "query", {
      get: () => ({ status: "open" }),
      configurable: true,
    });

    const { next, error } = runValidate(querySchema, req, "query");

    expect(error).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
    expect(req.query).toEqual({ status: "open" });
  });
});
