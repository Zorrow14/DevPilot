import { z } from "zod";

import {
  nonEmptyObject,
  requiredText,
  stringListField,
  userRoleField,
  userStatusField,
} from "./common";

export const updateProfileSchema = nonEmptyObject(
  z.object({
    name: requiredText("Name is required.", 120).optional(),
    // Distinct from `name`: an empty target role is a legitimate "not decided yet".
    targetRole: z
      .union([z.string(), z.null()])
      .transform((value) => (value === null ? null : value.trim()))
      .transform((value) => (value === "" ? null : value))
      .optional(),
    preferredStack: stringListField.optional(),
  }),
);

/** Admin-only: role and status are never self-serve on /users/me. */
export const updateUserRoleSchema = z.object({ role: userRoleField });
export const updateUserStatusSchema = z.object({ status: userStatusField });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
