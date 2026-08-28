import { z } from "zod";

import { feedbackStatusField, feedbackTypeField, requiredText } from "./common";

export const createFeedbackSchema = z.object({
  title: requiredText("Feedback title is required."),
  message: requiredText("Feedback message is required.", 4000),
  type: feedbackTypeField.optional(),
});

/** Admin triage. Status is the only field an admin may change on a submission. */
export const updateFeedbackStatusSchema = z.object({
  status: feedbackStatusField,
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackStatusInput = z.infer<typeof updateFeedbackStatusSchema>;
