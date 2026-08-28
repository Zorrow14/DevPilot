import { z } from "zod";

/**
 * Client-side form schemas.
 *
 * These deliberately mirror server/src/validators rather than being shared with
 * them — the two packages install independently, with no shared package to put
 * a common schema in. The server's copy is the one that actually protects the
 * database; these exist so a mistake is caught before a round trip, and so the
 * message lands on the field that caused it.
 *
 * Keep them in step with the server. Where they differ, the server wins.
 */

/** Matches the server's requiredText: trims first, then checks emptiness. */
function requiredText(message: string, max = 200) {
  return z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, { message })
    .refine((value) => value.length <= max, {
      message: `Must be ${max} characters or fewer.`,
    });
}

/**
 * Plain number rather than z.coerce: the field registers with
 * `valueAsNumber`, so React Hook Form has already converted it. Coercing here
 * as well would make the schema's input type `unknown`, which breaks the
 * resolver's type alignment with the form values.
 */
const progressField = z
  .number({ message: "Progress must be a whole number between 0 and 100." })
  .int("Progress must be a whole number between 0 and 100.")
  .min(0, "Progress must be a whole number between 0 and 100.")
  .max(100, "Progress must be a whole number between 0 and 100.");

/** An empty date input means "no deadline", not an invalid date. */
const optionalDate = z
  .string()
  .refine((value) => value === "" || !Number.isNaN(new Date(value).getTime()), {
    message: "Enter a valid date.",
  });

export const skillEditSchema = z.object({
  name: requiredText("Skill name is required."),
  category: requiredText("Skill category is required.", 60),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  progress: progressField,
  notes: z.string().max(4000, "Notes must be 4000 characters or fewer."),
});

export type SkillEditValues = z.infer<typeof skillEditSchema>;

export const projectEditSchema = z.object({
  title: requiredText("Project title is required."),
  description: z.string().max(4000, "Description must be 4000 characters or fewer."),
  techStack: z.string().max(500, "Tech stack must be 500 characters or fewer."),
  status: z.enum(["planning", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  deadline: optionalDate,
  progress: progressField,
});

export type ProjectEditValues = z.infer<typeof projectEditSchema>;

export const taskEditSchema = z.object({
  title: requiredText("Task title is required."),
  description: z.string().max(4000, "Description must be 4000 characters or fewer."),
  status: z.enum(["todo", "in-progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: optionalDate,
});

export type TaskEditValues = z.infer<typeof taskEditSchema>;

/** Splits the comma-separated tech stack field into the array the API takes. */
export function parseTechStack(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
