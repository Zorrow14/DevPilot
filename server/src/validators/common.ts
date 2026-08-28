import { z } from "zod";

/**
 * Shared field primitives.
 *
 * The API deliberately accepts the lowercase/kebab forms the frontend uses
 * (`"in-progress"`, `"high"`) and normalizes to the SCREAMING_SNAKE Prisma
 * enums here, so route handlers and services receive values that are already
 * in database form. This mirrors the `normalizeX` helpers the services grew
 * organically — those stay as a second line of defense for any caller that
 * bypasses a validated route.
 */

/** Accepts any casing and either separator, e.g. "in-progress" or "IN_PROGRESS". */
function enumFromLooseString<const T extends readonly [string, ...string[]]>(
  values: T,
  message: string,
) {
  return z
    .string()
    .transform((value) => value.trim().toUpperCase().replace(/-/g, "_"))
    .refine((value): value is T[number] => (values as readonly string[]).includes(value), {
      message,
    });
}

export const skillLevelField = enumFromLooseString(
  ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
  "Skill level must be BEGINNER, INTERMEDIATE, or ADVANCED.",
);

export const projectStatusField = enumFromLooseString(
  ["PLANNING", "IN_PROGRESS", "COMPLETED"],
  "Project status must be PLANNING, IN_PROGRESS, or COMPLETED.",
);

export const priorityField = enumFromLooseString(
  ["LOW", "MEDIUM", "HIGH"],
  "Priority must be LOW, MEDIUM, or HIGH.",
);

export const feedbackTypeField = enumFromLooseString(
  ["BUG", "FEATURE", "GENERAL"],
  "Feedback type must be BUG, FEATURE, or GENERAL.",
);

export const feedbackStatusField = enumFromLooseString(
  ["NEW", "IN_REVIEW", "RESOLVED", "REJECTED"],
  "Feedback status must be NEW, IN_REVIEW, RESOLVED, or REJECTED.",
);

export const userRoleField = enumFromLooseString(
  ["USER", "ADMIN"],
  "Role must be USER or ADMIN.",
);

export const userStatusField = enumFromLooseString(
  ["ACTIVE", "INACTIVE"],
  "Status must be ACTIVE or INACTIVE.",
);

/**
 * The client's task status vocabulary uses "done" where Prisma uses COMPLETED.
 * Mapped here so `TaskStatus` stays the single source of truth downstream.
 */
export const taskStatusField = z
  .string()
  .transform((value) => {
    const normalized = value.trim().toUpperCase().replace(/-/g, "_");
    return normalized === "DONE" ? "COMPLETED" : normalized;
  })
  .refine(
    (value): value is "TODO" | "IN_PROGRESS" | "COMPLETED" =>
      ["TODO", "IN_PROGRESS", "COMPLETED"].includes(value),
    { message: "Task status must be TODO, IN_PROGRESS, or COMPLETED." },
  );

export function progressField(entity: string) {
  return z
    .number()
    .int(`${entity} progress must be an integer between 0 and 100.`)
    .min(0, `${entity} progress must be an integer between 0 and 100.`)
    .max(100, `${entity} progress must be an integer between 0 and 100.`);
}

/**
 * A calendar date that may be explicitly cleared. `null` and `""` both mean
 * "unset" — the client sends `""` for an empty date input.
 */
export function nullableDateField(message: string) {
  return z
    .union([z.string(), z.null()])
    .transform((value) => (value === null || value.trim() === "" ? null : value))
    .refine((value) => value === null || !Number.isNaN(new Date(value).getTime()), { message });
}

/** Required, non-blank text with a trim applied before the emptiness check. */
export function requiredText(message: string, max = 200) {
  return z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, { message })
    .refine((value) => value.length <= max, {
      message: `${message.replace(/ is required\.$/, "")} must be ${max} characters or fewer.`,
    });
}

/** Optional prose that may be explicitly cleared. */
export const nullableText = z
  .union([z.string(), z.null()])
  .transform((value) => (value === null ? null : value.trim()))
  .transform((value) => (value === "" ? null : value));

/** A de-duplicated list of non-blank tags, matching normalizePreferredStack. */
export const stringListField = z
  .array(z.string(), { message: "Expected a list of strings." })
  .transform((entries) => Array.from(new Set(entries.map((e) => e.trim()).filter(Boolean))));

/** Rejects `{}` so a PATCH/PUT with nothing to change fails loudly. */
export function nonEmptyObject<T extends z.ZodType>(schema: T) {
  return schema.refine((value) => Object.keys(value as object).length > 0, {
    message: "Provide at least one field to update.",
  });
}

/** Route params are always strings; this just guards against an empty segment. */
export const idParam = z.object({
  id: z.string().min(1, "A resource id is required."),
});

export const projectIdParam = z.object({
  projectId: z.string().min(1, "A project id is required."),
});
