import { z } from "zod";

import {
  nonEmptyObject,
  nullableDateField,
  nullableText,
  priorityField,
  progressField,
  projectStatusField,
  requiredText,
  stringListField,
} from "./common";

const deadlineField = nullableDateField("Project deadline must be a valid date.");

export const createProjectSchema = z.object({
  title: requiredText("Project title is required."),
  description: nullableText.optional(),
  techStack: stringListField.optional(),
  status: projectStatusField.optional(),
  priority: priorityField.optional(),
  deadline: deadlineField.optional(),
  progress: progressField("Project").optional(),
});

export const updateProjectSchema = nonEmptyObject(
  z.object({
    title: requiredText("Project title is required.").optional(),
    description: nullableText.optional(),
    techStack: stringListField.optional(),
    status: projectStatusField.optional(),
    priority: priorityField.optional(),
    deadline: deadlineField.optional(),
    progress: progressField("Project").optional(),
  }),
);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
