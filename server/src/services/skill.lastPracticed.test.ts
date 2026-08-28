import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * lastPracticedAt exists as its own column precisely so it does NOT move for
 * every edit — updatedAt already does that. These tests pin which writes count
 * as practice, because the distinction is invisible from the schema alone.
 */

const prismaMock = {
  skill: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
};

vi.mock("../lib/prisma", () => ({ prisma: prismaMock }));

const skillService = await import("./skill.service");

const OWNER = "owner-user-id";

function storedSkill(overrides: Record<string, unknown> = {}) {
  return {
    id: "skill-1",
    userId: OWNER,
    name: "React",
    category: "Frontend",
    level: "BEGINNER",
    progress: 10,
    notes: null,
    lastPracticedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.skill.findFirst.mockResolvedValue(storedSkill());
  prismaMock.skill.update.mockResolvedValue(storedSkill());
});

describe("lastPracticedAt write rule", () => {
  it("stamps the date when progress moves", async () => {
    await skillService.updateSkill(OWNER, "skill-1", { progress: 50 });

    const { data } = prismaMock.skill.update.mock.calls[0][0];
    expect(data.lastPracticedAt).toBeInstanceOf(Date);
  });

  it("leaves the date untouched when only metadata changes", async () => {
    // Renaming or recategorising is not practice. `undefined` tells Prisma to
    // omit the column from the UPDATE entirely.
    await skillService.updateSkill(OWNER, "skill-1", { name: "React 19" });

    const { data } = prismaMock.skill.update.mock.calls[0][0];
    expect(data.lastPracticedAt).toBeUndefined();
  });

  it("treats a progress value of 0 as practice, not as absent", async () => {
    // Guards against an `if (progress)` truthiness check, which would skip 0.
    await skillService.updateSkill(OWNER, "skill-1", { progress: 0 });

    const { data } = prismaMock.skill.update.mock.calls[0][0];
    expect(data.lastPracticedAt).toBeInstanceOf(Date);
  });
});

describe("lastPracticed serialization", () => {
  it("renders a stored timestamp as a date-only string", async () => {
    prismaMock.skill.findMany.mockResolvedValue([
      storedSkill({ lastPracticedAt: new Date("2026-08-28T13:45:00.000Z") }),
    ]);

    const [skill] = await skillService.getSkills(OWNER);

    expect(skill.lastPracticed).toBe("2026-08-28");
  });

  it("renders a never-practised skill as an empty string, not null", async () => {
    // The client checks falsiness to pick its empty-state copy; null would
    // render as the literal text "null" if it ever reached a template.
    prismaMock.skill.findMany.mockResolvedValue([storedSkill({ lastPracticedAt: null })]);

    const [skill] = await skillService.getSkills(OWNER);

    expect(skill.lastPracticed).toBe("");
  });

  it("does not stamp a practice date on create", async () => {
    // Adding a skill you intend to learn is not the same as having practised it.
    prismaMock.skill.create.mockResolvedValue(storedSkill());

    await skillService.createSkill(OWNER, { name: "Prisma", category: "Database" });

    const { data } = prismaMock.skill.create.mock.calls[0][0];
    expect(data.lastPracticedAt).toBeUndefined();
  });
});
