import { z } from "zod";

import { nonEmptyObject, requiredText } from "./common";

export const createAnnouncementSchema = z.object({
  title: requiredText("Announcement title is required."),
  message: requiredText("Announcement message is required.", 4000),
});

export const updateAnnouncementSchema = nonEmptyObject(
  z.object({
    title: requiredText("Announcement title is required.").optional(),
    message: requiredText("Announcement message is required.", 4000).optional(),
  }),
);

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
