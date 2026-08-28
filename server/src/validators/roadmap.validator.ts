import { z } from "zod";

import { requiredText, stringListField } from "./common";

/**
 * Input for AI roadmap generation. These four fields become the prompt, so they
 * are length-capped: the generator runs on Gemini's free tier, where an
 * oversized prompt is a wasted request against a small quota.
 */
export const generateRoadmapSchema = z.object({
  goal: requiredText("Career goal is required.", 300),
  targetRole: requiredText("Target role is required.", 120),
  duration: requiredText("Duration is required.", 60),
  currentSkills: stringListField.optional().default([]),
});

export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>;
