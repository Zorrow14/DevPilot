import type { Announcement } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { NotFoundError, ValidationError } from "../utils/errors";

export type AnnouncementPayload = {
  title?: string;
  message?: string;
};

/** The author, joined in for the admin panel. */
type AnnouncementWithAuthor = Announcement & {
  createdBy?: { id: string; name: string } | null;
};

function formatAnnouncement(announcement: AnnouncementWithAuthor) {
  return {
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    createdById: announcement.createdById,
    createdByName: announcement.createdBy?.name ?? "",
    createdAt: announcement.createdAt.toISOString().slice(0, 10),
    updatedAt: announcement.updatedAt.toISOString().slice(0, 10),
  };
}

export type AnnouncementView = ReturnType<typeof formatAnnouncement>;

const authorSelect = {
  select: { id: true, name: true },
} as const;

/**
 * Every announcement, newest first.
 *
 * Not user-scoped by design — announcements are platform content shown to
 * everyone, which is also why Announcement.createdBy does not cascade on user
 * deletion.
 */
export async function getAnnouncements() {
  const announcements = await prisma.announcement.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      createdBy: authorSelect,
    },
  });

  return announcements.map(formatAnnouncement);
}

export async function createAnnouncement(authorId: string, payload: AnnouncementPayload) {
  if (!payload.title || !payload.message) {
    throw new ValidationError("Announcement title and message are required.");
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: payload.title,
      message: payload.message,
      createdById: authorId,
    },
    include: {
      createdBy: authorSelect,
    },
  });

  return formatAnnouncement(announcement);
}

/**
 * Not scoped to the original author: any admin can correct any announcement.
 * The route is behind requireAdmin, which is where that authority comes from.
 */
export async function updateAnnouncement(announcementId: string, payload: AnnouncementPayload) {
  await findAnnouncement(announcementId);

  const announcement = await prisma.announcement.update({
    where: {
      id: announcementId,
    },
    data: {
      title: payload.title,
      message: payload.message,
    },
    include: {
      createdBy: authorSelect,
    },
  });

  return formatAnnouncement(announcement);
}

export async function deleteAnnouncement(announcementId: string) {
  await findAnnouncement(announcementId);

  await prisma.announcement.delete({
    where: {
      id: announcementId,
    },
  });
}

async function findAnnouncement(announcementId: string) {
  const announcement = await prisma.announcement.findUnique({
    where: {
      id: announcementId,
    },
  });

  if (!announcement) {
    throw new NotFoundError("Announcement");
  }

  return announcement;
}
