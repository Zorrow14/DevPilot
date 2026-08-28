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

export async function getProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
}

export async function updateProfile(userId: string, payload: UserProfilePayload) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: normalizeName(payload.name),
      targetRole: normalizeTargetRole(payload.targetRole),
      preferredStack: normalizePreferredStack(payload.preferredStack),
    },
  });
}
