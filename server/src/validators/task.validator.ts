import { z } from "zod";

import {
  nonEmptyObject,
  nullableDateField,
  nullableText,
  priorityField,
  requiredText,
  taskStatusField,
} from "./common";

const dueDateField = nullableDateField("Task due date must be a valid date.");

export const createTaskSchema = z.object({
  title: requiredText("Task title is required."),
  description: nullableText.optional(),
  status: taskStatusField.optional(),
  priority: priorityField.optional(),
  dueDate: dueDateField.optional(),
});

export const updateTaskSchema = nonEmptyObject(
  z.object({
    title: requiredText("Task title is required.").optional(),
    description: nullableText.optional(),
    status: taskStatusField.optional(),
    priority: priorityField.optional(),
    dueDate: dueDateField.optional(),
  }),
);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
