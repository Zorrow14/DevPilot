import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

import { ValidationError } from "../utils/errors";

type RequestPart = "body" | "params" | "query";

/**
 * Validates one part of the request against a Zod schema and replaces it with
 * the parsed result, so handlers downstream receive coerced, trimmed values
 * rather than raw input.
 *
 * Express 5 exposes `req.query` through a getter with no setter, so the parsed
 * query is assigned via defineProperty rather than plain assignment.
 */
export function validate(schema: ZodType, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(toValidationError(result.error, part));
      return;
    }

    if (part === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
      });
      return next();
    }

    req[part] = result.data as never;
    next();
  };
}

function toValidationError(error: ZodError, part: RequestPart) {
  const issues: Record<string, string[]> = {};

  for (const issue of error.issues) {
    // Top-level failures (e.g. "expected object, received string") have an
    // empty path; group them under the part they came from so the response
    // still says where the problem is.
    const key = issue.path.length > 0 ? issue.path.join(".") : part;
    issues[key] = [...(issues[key] ?? []), issue.message];
  }

  const [firstField] = Object.keys(issues);
  const summary = firstField ? issues[firstField][0] : "Request validation failed.";

  return new ValidationError(summary, issues);
}
