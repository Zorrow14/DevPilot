import { z } from "zod";

import { priorityField, projectStatusField, userRoleField, userStatusField } from "./common";

/** Free-text search over name and email. Absent means "no filter". */
export const adminUserQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
});

export const adminProjectQuerySchema = z.object({
  status: projectStatusField.optional(),
  priority: priorityField.optional(),
});

export const updateUserRoleSchema = z.object({ role: userRoleField });
export const updateUserStatusSchema = z.object({ status: userStatusField });

export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;
export type AdminProjectQuery = z.infer<typeof adminProjectQuerySchema>;
