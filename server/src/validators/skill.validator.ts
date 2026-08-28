import { z } from "zod";

import {
  nonEmptyObject,
  nullableText,
  progressField,
  requiredText,
  skillLevelField,
} from "./common";

export const createSkillSchema = z.object({
  name: requiredText("Skill name is required."),
  category: requiredText("Skill category is required.", 60),
  level: skillLevelField.optional(),
  progress: progressField("Skill").optional(),
  notes: nullableText.optional(),
});

export const updateSkillSchema = nonEmptyObject(
  z.object({
    name: requiredText("Skill name is required.").optional(),
    category: requiredText("Skill category is required.", 60).optional(),
    level: skillLevelField.optional(),
    progress: progressField("Skill").optional(),
    notes: nullableText.optional(),
  }),
);

export type CreateSkillInput = z.infer<typeof createSkillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
