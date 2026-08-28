import type { User } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { ValidationError } from "../utils/errors";

export type UserProfilePayload = {
  name?: string;
  targetRole?: string | null;
  preferredStack?: string[];
};

function normalizeName(name?: string) {
  if (name === undefined) {
    return undefined;
  }

  const trimmed = name.trim();

  if (!trimmed) {
    throw new ValidationError("Name is required.");
  }

  return trimmed;
}

function normalizeTargetRole(targetRole?: string | null) {
  if (targetRole === undefined) {
    return undefined;
  }

  return targetRole?.trim() ? targetRole.trim() : null;
}

function normalizePreferredStack(preferredStack?: string[]) {
  if (preferredStack === undefined) {
    return undefined;
  }

  if (!Array.isArray(preferredStack)) {
    throw new ValidationError("Preferred stack must be a list of strings.");
  }

  const cleaned = preferredStack
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(cleaned));
}

/**
 * Serializes a user row for the API.
 *
 * /users/me previously returned the raw Prisma row, so role and status came
 * back SCREAMING_SNAKE here while /dashboard/stats lowercased the same two
 * columns. Clients then had to know which endpoint they were holding. This
 * follows the repo convention that API responses speak lowercase.
 */
function formatUser(user: User) {
  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
    targetRole: user.targetRole,
    preferredStack: user.preferredStack,
    role: user.role.toLowerCase(),
    status: user.status.toLowerCase(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  return formatUser(user);
}

export async function updateProfile(userId: string, payload: UserProfilePayload) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: normalizeName(payload.name),
      targetRole: normalizeTargetRole(payload.targetRole),
      preferredStack: normalizePreferredStack(payload.preferredStack),
    },
  });

  return formatUser(user);
}
