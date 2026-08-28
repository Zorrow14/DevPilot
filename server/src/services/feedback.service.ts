import type { Feedback, FeedbackStatus, FeedbackType } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { NotFoundError, ValidationError } from "../utils/errors";

export type FeedbackPayload = {
  title?: string;
  message?: string;
  type?: string;
};

/** The submitter, joined in for the admin triage table. */
type FeedbackWithUser = Feedback & {
  user?: { id: string; name: string; email: string } | null;
};

function formatFeedback(feedback: FeedbackWithUser) {
  return {
    id: feedback.id,
    userId: feedback.userId,
    // Only present on the admin queries, which join the submitter. A user
    // listing their own feedback already knows who wrote it.
    userName: feedback.user?.name ?? "",
    userEmail: feedback.user?.email ?? "",
    title: feedback.title,
    message: feedback.message,
    type: feedback.type.toLowerCase(),
    status: feedback.status.toLowerCase().replace("_", "-"),
    createdAt: feedback.createdAt.toISOString().slice(0, 10),
    updatedAt: feedback.updatedAt.toISOString().slice(0, 10),
  };
}

export type FeedbackView = ReturnType<typeof formatFeedback>;

function normalizeFeedbackType(type?: string): FeedbackType | undefined {
  if (!type) {
    return undefined;
  }

  const normalized = type.toUpperCase();

  if (normalized !== "BUG" && normalized !== "FEATURE" && normalized !== "GENERAL") {
    throw new ValidationError("Feedback type must be BUG, FEATURE, or GENERAL.");
  }

  return normalized;
}

function normalizeFeedbackStatus(status?: string): FeedbackStatus {
  const normalized = status?.toUpperCase().replace("-", "_");

  if (
    normalized !== "NEW" &&
    normalized !== "IN_REVIEW" &&
    normalized !== "RESOLVED" &&
    normalized !== "REJECTED"
  ) {
    throw new ValidationError("Feedback status must be NEW, IN_REVIEW, RESOLVED, or REJECTED.");
  }

  return normalized;
}

const submitterSelect = {
  select: { id: true, name: true, email: true },
} as const;

/** Feedback the requesting user submitted. */
export async function getMyFeedback(userId: string) {
  const feedback = await prisma.feedback.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return feedback.map(formatFeedback);
}

export async function createFeedback(userId: string, payload: FeedbackPayload) {
  if (!payload.title || !payload.message) {
    throw new ValidationError("Feedback title and message are required.");
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId,
      title: payload.title,
      message: payload.message,
      type: normalizeFeedbackType(payload.type) ?? "GENERAL",
    },
  });

  return formatFeedback(feedback);
}

export async function deleteMyFeedback(userId: string, feedbackId: string) {
  // Scoped by userId in the same query rather than fetch-then-check, so there
  // is no window between the ownership test and the delete.
  const existing = await prisma.feedback.findFirst({
    where: {
      id: feedbackId,
      userId,
    },
  });

  if (!existing) {
    throw new NotFoundError("Feedback");
  }

  await prisma.feedback.delete({
    where: {
      id: feedbackId,
    },
  });
}

/**
 * Every submission, for admin triage. Deliberately not user-scoped — the route
 * that exposes it is behind requireAdmin.
 */
export async function getAllFeedback() {
  const feedback = await prisma.feedback.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      user: submitterSelect,
    },
  });

  return feedback.map(formatFeedback);
}

export async function updateFeedbackStatus(feedbackId: string, status: string) {
  const existing = await prisma.feedback.findUnique({
    where: {
      id: feedbackId,
    },
  });

  if (!existing) {
    throw new NotFoundError("Feedback");
  }

  const feedback = await prisma.feedback.update({
    where: {
      id: feedbackId,
    },
    data: {
      status: normalizeFeedbackStatus(status),
    },
    include: {
      user: submitterSelect,
    },
  });

  return formatFeedback(feedback);
}
