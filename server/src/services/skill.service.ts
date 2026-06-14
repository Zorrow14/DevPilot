import type { Skill, SkillLevel } from "@prisma/client";

import { prisma } from "../lib/prisma";

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

export async function getSkills(userId: string) {
  const skills = await prisma.skill.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return skills.map(formatSkill);
}

export async function createSkill(userId: string, payload: SkillPayload) {
  if (!payload.name || !payload.category) {
    throw new Error("Skill name and category are required.");
  }

  const skill = await prisma.skill.create({
    data: {
      userId,
      name: payload.name,
      category: payload.category,
      level: normalizeSkillLevel(payload.level) ?? "BEGINNER",
      progress: normalizeProgress(payload.progress) ?? 0,
      notes: payload.notes ?? null,
    },
  });

  return formatSkill(skill);
}

export async function updateSkill(
  userId: string,
  skillId: string,
  payload: SkillPayload,
) {
  await findOwnedSkill(skillId, userId);

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

export async function deleteSkill(userId: string, skillId: string) {
  await findOwnedSkill(skillId, userId);

  await prisma.skill.delete({
    where: {
      id: skillId,
    },
  });
}
