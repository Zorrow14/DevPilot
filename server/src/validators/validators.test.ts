import { describe, expect, it } from "vitest";

import { createProjectSchema, updateProjectSchema } from "./project.validator";
import { createSkillSchema, updateSkillSchema } from "./skill.validator";
import { createTaskSchema, updateTaskSchema } from "./task.validator";
import { updateProfileSchema } from "./user.validator";

/**
 * The API accepts the lowercase/kebab vocabulary the frontend uses and hands
 * SCREAMING_SNAKE Prisma enums to the services. These tests pin that contract
 * from both directions — a schema that stopped transforming would still accept
 * the frontend's input while writing an invalid enum to Postgres.
 */

describe("skill validators", () => {
  it("normalizes a lowercase level to the Prisma enum", () => {
    const parsed = createSkillSchema.parse({ name: "React", category: "Frontend", level: "advanced" });
    expect(parsed.level).toBe("ADVANCED");
  });

  it("trims name and category", () => {
    const parsed = createSkillSchema.parse({ name: "  React  ", category: "  Frontend  " });
    expect(parsed).toMatchObject({ name: "React", category: "Frontend" });
  });

  it("rejects a blank name that is only whitespace", () => {
    const result = createSkillSchema.safeParse({ name: "   ", category: "Frontend" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown level", () => {
    const result = createSkillSchema.safeParse({ name: "React", category: "FE", level: "wizard" });
    expect(result.success).toBe(false);
  });

  it.each([-1, 101, 12.5])("rejects out-of-range or fractional progress: %s", (progress) => {
    const result = createSkillSchema.safeParse({ name: "React", category: "FE", progress });
    expect(result.success).toBe(false);
  });

  it("rejects an empty update so a no-op PUT fails loudly", () => {
    expect(updateSkillSchema.safeParse({}).success).toBe(false);
  });

  it("allows a partial update", () => {
    expect(updateSkillSchema.safeParse({ progress: 55 }).success).toBe(true);
  });
});

describe("project validators", () => {
  it("maps the frontend's kebab status to the Prisma enum", () => {
    const parsed = createProjectSchema.parse({ title: "Portfolio", status: "in-progress" });
    expect(parsed.status).toBe("IN_PROGRESS");
  });

  it("accepts the enum form unchanged", () => {
    const parsed = createProjectSchema.parse({ title: "Portfolio", status: "IN_PROGRESS" });
    expect(parsed.status).toBe("IN_PROGRESS");
  });

  it("treats an empty deadline as an explicit clear", () => {
    // The date input submits "" when the user empties it.
    expect(createProjectSchema.parse({ title: "P", deadline: "" }).deadline).toBeNull();
    expect(createProjectSchema.parse({ title: "P", deadline: null }).deadline).toBeNull();
  });

  it("rejects an unparseable deadline", () => {
    const result = createProjectSchema.safeParse({ title: "P", deadline: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("de-duplicates and trims the tech stack", () => {
    const parsed = createProjectSchema.parse({
      title: "P",
      techStack: [" Next.js ", "Next.js", "", "  ", "Prisma"],
    });
    expect(parsed.techStack).toEqual(["Next.js", "Prisma"]);
  });

  it("rejects an empty update", () => {
    expect(updateProjectSchema.safeParse({}).success).toBe(false);
  });
});

describe("task validators", () => {
  it("maps the client's 'done' vocabulary onto COMPLETED", () => {
    // The frontend says "done"; Prisma's TaskStatus says COMPLETED.
    expect(createTaskSchema.parse({ title: "Ship", status: "done" }).status).toBe("COMPLETED");
  });

  it("maps 'todo' and 'in-progress' through unchanged in meaning", () => {
    expect(createTaskSchema.parse({ title: "T", status: "todo" }).status).toBe("TODO");
    expect(createTaskSchema.parse({ title: "T", status: "in-progress" }).status).toBe("IN_PROGRESS");
  });

  it("rejects an unknown status", () => {
    expect(createTaskSchema.safeParse({ title: "T", status: "blocked" }).success).toBe(false);
  });

  it("requires a title on create but allows a status-only update", () => {
    expect(createTaskSchema.safeParse({ status: "done" }).success).toBe(false);
    expect(updateTaskSchema.safeParse({ status: "done" }).success).toBe(true);
  });
});

describe("profile validator", () => {
  it("treats an empty target role as 'not decided yet', not an error", () => {
    expect(updateProfileSchema.parse({ targetRole: "  " }).targetRole).toBeNull();
  });

  it("still rejects a blank name", () => {
    expect(updateProfileSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("de-duplicates the preferred stack", () => {
    const parsed = updateProfileSchema.parse({ preferredStack: ["React", "React", " Prisma "] });
    expect(parsed.preferredStack).toEqual(["React", "Prisma"]);
  });

  it("rejects a non-array preferred stack", () => {
    expect(updateProfileSchema.safeParse({ preferredStack: "React" }).success).toBe(false);
  });
});
