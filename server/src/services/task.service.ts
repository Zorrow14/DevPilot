import type { Priority, Task, TaskStatus } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { getTemporaryUser } from "./devUser.service";

export type TaskPayload = {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
};

function formatTask(task: Task) {
  return {
    ...task,
    description: task.description ?? "",
    status: task.status === "COMPLETED" ? "done" : task.status.toLowerCase().replace("_", "-"),
    priority: task.priority.toLowerCase(),
    dueDate: task.dueDate?.toISOString().slice(0, 10) ?? "",
    completed: task.status === "COMPLETED",
  };
}

function normalizeTaskStatus(status?: string): TaskStatus | undefined {
  if (!status) {
    return undefined;
  }

  const normalizedStatus = status.toUpperCase().replace("-", "_").replace("DONE", "COMPLETED");

  if (
    normalizedStatus !== "TODO" &&
    normalizedStatus !== "IN_PROGRESS" &&
    normalizedStatus !== "COMPLETED"
  ) {
    throw new Error("Task status must be TODO, IN_PROGRESS, or COMPLETED.");
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

function normalizeDueDate(dueDate?: string | null): Date | null | undefined {
  if (dueDate === undefined) {
    return undefined;
  }

  if (!dueDate) {
    return null;
  }

  const date = new Date(dueDate);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Task due date must be a valid date.");
  }

  return date;
}

async function findOwnedProject(projectId: string) {
  const user = await getTemporaryUser();
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  return project;
}

async function findOwnedTask(taskId: string) {
  const user = await getTemporaryUser();
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        userId: user.id,
      },
    },
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  return task;
}

export async function getProjectTasks(projectId: string) {
  await findOwnedProject(projectId);

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks.map(formatTask);
}

export async function createTask(projectId: string, payload: TaskPayload) {
  if (!payload.title) {
    throw new Error("Task title is required.");
  }

  await findOwnedProject(projectId);

  const task = await prisma.task.create({
    data: {
      projectId,
      title: payload.title,
      description: payload.description ?? null,
      status: normalizeTaskStatus(payload.status) ?? "TODO",
      priority: normalizePriority(payload.priority) ?? "MEDIUM",
      dueDate: normalizeDueDate(payload.dueDate) ?? null,
    },
  });

  return formatTask(task);
}

export async function updateTask(taskId: string, payload: TaskPayload) {
  await findOwnedTask(taskId);

  const task = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      title: payload.title,
      description: payload.description,
      status: normalizeTaskStatus(payload.status),
      priority: normalizePriority(payload.priority),
      dueDate: normalizeDueDate(payload.dueDate),
    },
  });

  return formatTask(task);
}

export async function deleteTask(taskId: string) {
  await findOwnedTask(taskId);

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
}
