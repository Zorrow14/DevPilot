import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Cross-tenant access guard.
 *
 * Every mutating service call resolves the row through a `findOwnedX` helper
 * that scopes the query by the requesting user. These tests assert on the
 * *query that was issued*, not just on the thrown error — a refactor that drops
 * the `userId` scope would still throw "not found" for a genuinely missing id
 * while silently exposing other users' rows, and only the query assertion
 * catches that.
 */

const prismaMock = {
  skill: { findFirst: vi.fn(), update: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
  project: { findFirst: vi.fn(), update: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
  task: { findFirst: vi.fn(), update: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
};

vi.mock("../lib/prisma", () => ({ prisma: prismaMock }));

const skillService = await import("./skill.service");
const projectService = await import("./project.service");
const taskService = await import("./task.service");

const OWNER = "owner-user-id";
const OTHER_USERS_ROW = null; // what findFirst returns when the scope excludes the row

beforeEach(() => {
  vi.clearAllMocks();
});

describe("skill ownership", () => {
  it("scopes the lookup to the requesting user", async () => {
    prismaMock.skill.findFirst.mockResolvedValue({ id: "skill-1", userId: OWNER, level: "BEGINNER" });
    prismaMock.skill.update.mockResolvedValue({ id: "skill-1", userId: OWNER, level: "BEGINNER" });

    await skillService.updateSkill(OWNER, "skill-1", { progress: 40 });

    expect(prismaMock.skill.findFirst).toHaveBeenCalledWith({
      where: { id: "skill-1", userId: OWNER },
    });
  });

  it("refuses to update another user's skill", async () => {
    prismaMock.skill.findFirst.mockResolvedValue(OTHER_USERS_ROW);

    await expect(skillService.updateSkill(OWNER, "someone-elses-skill", { progress: 40 })).rejects.toThrow(
      /not found/i,
    );
    expect(prismaMock.skill.update).not.toHaveBeenCalled();
  });

  it("refuses to delete another user's skill", async () => {
    prismaMock.skill.findFirst.mockResolvedValue(OTHER_USERS_ROW);

    await expect(skillService.deleteSkill(OWNER, "someone-elses-skill")).rejects.toThrow(/not found/i);
    expect(prismaMock.skill.delete).not.toHaveBeenCalled();
  });

  it("lists only the requesting user's skills", async () => {
    prismaMock.skill.findMany.mockResolvedValue([]);

    await skillService.getSkills(OWNER);

    expect(prismaMock.skill.findMany.mock.calls[0][0].where).toEqual({ userId: OWNER });
  });
});

describe("project ownership", () => {
  it("scopes the lookup to the requesting user", async () => {
    prismaMock.project.findFirst.mockResolvedValue({
      id: "project-1",
      userId: OWNER,
      status: "PLANNING",
      priority: "MEDIUM",
      deadline: null,
      description: null,
    });

    await projectService.getProject(OWNER, "project-1");

    expect(prismaMock.project.findFirst).toHaveBeenCalledWith({
      where: { id: "project-1", userId: OWNER },
    });
  });

  it("refuses to read another user's project", async () => {
    prismaMock.project.findFirst.mockResolvedValue(OTHER_USERS_ROW);

    await expect(projectService.getProject(OWNER, "someone-elses-project")).rejects.toThrow(
      /not found/i,
    );
  });

  it("refuses to delete another user's project", async () => {
    prismaMock.project.findFirst.mockResolvedValue(OTHER_USERS_ROW);

    await expect(projectService.deleteProject(OWNER, "someone-elses-project")).rejects.toThrow(
      /not found/i,
    );
    expect(prismaMock.project.delete).not.toHaveBeenCalled();
  });

  it("lists only the requesting user's projects", async () => {
    prismaMock.project.findMany.mockResolvedValue([]);

    await projectService.getProjects(OWNER);

    expect(prismaMock.project.findMany.mock.calls[0][0].where).toEqual({ userId: OWNER });
  });
});

describe("task ownership", () => {
  // Task has no userId column — ownership resolves through its parent project,
  // which is the easiest guard to get wrong.
  it("scopes the lookup through the parent project's owner", async () => {
    prismaMock.task.findFirst.mockResolvedValue({
      id: "task-1",
      projectId: "project-1",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: null,
      description: null,
    });
    prismaMock.task.update.mockResolvedValue({
      id: "task-1",
      projectId: "project-1",
      status: "COMPLETED",
      priority: "MEDIUM",
      dueDate: null,
      description: null,
    });

    await taskService.updateTask(OWNER, "task-1", { status: "done" });

    expect(prismaMock.task.findFirst).toHaveBeenCalledWith({
      where: { id: "task-1", project: { userId: OWNER } },
    });
  });

  it("refuses to update a task under another user's project", async () => {
    prismaMock.task.findFirst.mockResolvedValue(OTHER_USERS_ROW);

    await expect(taskService.updateTask(OWNER, "someone-elses-task", { status: "done" })).rejects.toThrow(
      /not found/i,
    );
    expect(prismaMock.task.update).not.toHaveBeenCalled();
  });

  it("refuses to delete a task under another user's project", async () => {
    prismaMock.task.findFirst.mockResolvedValue(OTHER_USERS_ROW);

    await expect(taskService.deleteTask(OWNER, "someone-elses-task")).rejects.toThrow(/not found/i);
    expect(prismaMock.task.delete).not.toHaveBeenCalled();
  });

  it("refuses to list tasks for another user's project", async () => {
    prismaMock.project.findFirst.mockResolvedValue(OTHER_USERS_ROW);

    await expect(taskService.getProjectTasks(OWNER, "someone-elses-project")).rejects.toThrow(
      /not found/i,
    );
    expect(prismaMock.task.findMany).not.toHaveBeenCalled();
  });

  it("refuses to create a task under another user's project", async () => {
    prismaMock.project.findFirst.mockResolvedValue(OTHER_USERS_ROW);

    await expect(
      taskService.createTask(OWNER, "someone-elses-project", { title: "Injected task" }),
    ).rejects.toThrow(/not found/i);
  });
});
