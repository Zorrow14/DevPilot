import type { Priority, Project, ProjectStatus } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { getTemporaryUser } from "./devUser.service";

export type ProjectPayload = {
  title?: string;
  description?: string | null;
  techStack?: string[];
  status?: string;
  priority?: string;
  deadline?: string | null;
  progress?: number;
};

function formatProject(project: Project) {
  return {
    ...project,
    description: project.description ?? "",
    status: project.status.toLowerCase().replace("_", "-"),
    priority: project.priority.toLowerCase(),
    deadline: project.deadline?.toISOString().slice(0, 10) ?? "",
  };
}

function normalizeProjectStatus(status?: string): ProjectStatus | undefined {
  if (!status) {
    return undefined;
  }

  const normalizedStatus = status.toUpperCase().replace("-", "_");

  if (
    normalizedStatus !== "PLANNING" &&
    normalizedStatus !== "IN_PROGRESS" &&
    normalizedStatus !== "COMPLETED"
  ) {
    throw new Error("Project status must be PLANNING, IN_PROGRESS, or COMPLETED.");
  }

  return normalizedStatus;
}

function normalizePriority(priority?: string): Priority | undefined {
  if (!priority) {
    return undefined;
  }

  const normalizedPriority = priority.toUpperCase();

  if (
    normalizedPriority !== "LOW" &&
    normalizedPriority !== "MEDIUM" &&
    normalizedPriority !== "HIGH"
  ) {
    throw new Error("Priority must be LOW, MEDIUM, or HIGH.");
  }

  return normalizedPriority;
}

function normalizeProgress(progress?: number): number | undefined {
  if (progress === undefined) {
    return undefined;
  }

  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw new Error("Project progress must be an integer between 0 and 100.");
  }

  return progress;
}

function normalizeDeadline(deadline?: string | null): Date | null | undefined {
  if (deadline === undefined) {
    return undefined;
  }

  if (!deadline) {
    return null;
  }

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Project deadline must be a valid date.");
  }

  return date;
}

async function findOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  return project;
}

export async function getProjects() {
  const user = await getTemporaryUser();
  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects.map(formatProject);
}

export async function getProject(projectId: string) {
  const user = await getTemporaryUser();
  const project = await findOwnedProject(projectId, user.id);

  return formatProject(project);
}

export async function createProject(payload: ProjectPayload) {
  if (!payload.title) {
    throw new Error("Project title is required.");
  }

  const user = await getTemporaryUser();
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: payload.title,
      description: payload.description ?? null,
      techStack: payload.techStack ?? [],
      status: normalizeProjectStatus(payload.status) ?? "PLANNING",
      priority: normalizePriority(payload.priority) ?? "MEDIUM",
      deadline: normalizeDeadline(payload.deadline) ?? null,
      progress: normalizeProgress(payload.progress) ?? 0,
    },
  });

  return formatProject(project);
}

export async function updateProject(projectId: string, payload: ProjectPayload) {
  const user = await getTemporaryUser();
  await findOwnedProject(projectId, user.id);

  const project = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      title: payload.title,
      description: payload.description,
      techStack: payload.techStack,
      status: normalizeProjectStatus(payload.status),
      priority: normalizePriority(payload.priority),
      deadline: normalizeDeadline(payload.deadline),
      progress: normalizeProgress(payload.progress),
    },
  });

  return formatProject(project);
}

export async function deleteProject(projectId: string) {
  const user = await getTemporaryUser();
  await findOwnedProject(projectId, user.id);

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });
}
