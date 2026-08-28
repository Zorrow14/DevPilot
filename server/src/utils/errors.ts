/**
 * Typed application errors.
 *
 * These replace the substring matching controllers previously used to pick a
 * status code (`error.message.includes("not found")`), which coupled the HTTP
 * contract to prose: rewording a message silently changed the status, and any
 * unrelated error whose text happened to contain "required" was reported as a
 * 400. Throwing a typed error states the intent once, at the point that knows it.
 */

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    /**
     * Whether the message is safe to show a client. Internal failures (Prisma,
     * Firebase) must not leak their text, so anything not thrown deliberately
     * is reported generically — see error.middleware.ts.
     */
    readonly expose = true,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** 400 — the request itself is malformed or fails a business rule. */
export class ValidationError extends AppError {
  constructor(
    message: string,
    /** Field-keyed messages, populated when the failure came from a Zod schema. */
    readonly issues?: Record<string, string[]>,
  ) {
    super(400, message);
  }
}

/**
 * 404 — also used when a row exists but belongs to another user. Deliberately
 * indistinguishable from a genuinely missing row so the API cannot be used to
 * probe which ids exist.
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found.`);
  }
}

/** 401 — no usable identity on the request. */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required.") {
    super(401, message);
  }
}

/** 403 — authenticated, but not allowed. */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have access to this resource.") {
    super(403, message);
  }
}

/** 503 — a healthy request we could not serve because a dependency is down. */
export class ServiceUnavailableError extends AppError {
  constructor(message = "This service is temporarily unavailable.") {
    super(503, message);
  }
}
