import type { Skill, SkillLevel } from "@prisma/client";

import { prisma } from "../lib/prisma";

const TEMPORARY_USER = {
  firebaseUid: "temporary-dev-user",
  email: "devpilot.test@example.com",
  name: "DevPilot Test User",
};

export type SkillPayload = {
  name?: string;
  category?: string;
  level?: string;
  progress?: number;
  notes?: string | null;
};

function formatSkill(skill: Skill) {
  return {
    ...skill,
    level: skill.level.toLowerCase(),
    lastPracticed: "Today",
  };
}

function normalizeSkillLevel(level?: string): SkillLevel | undefined {
  if (!level) {
    return undefined;
  }

  const normalizedLevel = level.toUpperCase();

  if (
    normalizedLevel !== "BEGINNER" &&
    normalizedLevel !== "INTERMEDIATE" &&
    normalizedLevel !== "ADVANCED"
  ) {
    throw new Error("Skill level must be BEGINNER, INTERMEDIATE, or ADVANCED.");
  }

  return normalizedLevel;
}

function normalizeProgress(progress?: number): number | undefined {
  if (progress === undefined) {
    return undefined;
  }

  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw new Error("Skill progress must be an integer between 0 and 100.");
  }

  return progress;
}

async function getTemporaryUser() {
  return prisma.user.upsert({
    where: {
      firebaseUid: TEMPORARY_USER.firebaseUid,
    },
    update: {
      email: TEMPORARY_USER.email,
      name: TEMPORARY_USER.name,
    },
    create: TEMPORARY_USER,
  });
}

async function findOwnedSkill(skillId: string, userId: string) {
  const skill = await prisma.skill.findFirst({
    where: {
      id: skillId,
      userId,
    },
  });

  if (!skill) {
    throw new Error("Skill not found.");
  }

  return skill;
}

export async function getSkills() {
  const user = await getTemporaryUser();
  const skills = await prisma.skill.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return skills.map(formatSkill);
}

export async function createSkill(payload: SkillPayload) {
  if (!payload.name || !payload.category) {
    throw new Error("Skill name and category are required.");
  }

  const user = await getTemporaryUser();
  const skill = await prisma.skill.create({
    data: {
      userId: user.id,
      name: payload.name,
      category: payload.category,
      level: normalizeSkillLevel(payload.level) ?? "BEGINNER",
      progress: normalizeProgress(payload.progress) ?? 0,
      notes: payload.notes ?? null,
    },
  });

  return formatSkill(skill);
}

export async function updateSkill(skillId: string, payload: SkillPayload) {
  const user = await getTemporaryUser();
  await findOwnedSkill(skillId, user.id);

  const skill = await prisma.skill.update({
    where: {
      id: skillId,
    },
    data: {
      name: payload.name,
      category: payload.category,
      level: normalizeSkillLevel(payload.level),
      progress: normalizeProgress(payload.progress),
      notes: payload.notes,
    },
  });

  return formatSkill(skill);
}

export async function deleteSkill(skillId: string) {
  const user = await getTemporaryUser();
  await findOwnedSkill(skillId, user.id);

  await prisma.skill.delete({
    where: {
      id: skillId,
    },
  });
}
