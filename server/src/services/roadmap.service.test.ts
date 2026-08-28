import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The Gemini call is mocked throughout — these tests pin the logic around it
 * (validation of what comes back, ownership, step-status derivation, failure
 * translation), which is where the bugs live. Nothing here reaches the network.
 */

const prismaMock = {
  roadmap: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const generateContentMock = vi.fn();

vi.mock("../lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("../config/gemini", () => ({
  GEMINI_MODEL: "gemini-3.6-flash",
  isGeminiConfigured: () => true,
  getGeminiClient: async () => ({ models: { generateContent: generateContentMock } }),
  resetGeminiClient: () => {},
}));

const roadmapService = await import("./roadmap.service");
const { ServiceUnavailableError, NotFoundError, ValidationError } = await import(
  "../utils/errors"
);

const OWNER = "owner-user-id";

function validContent(overrides: Record<string, unknown> = {}) {
  return {
    title: "Frontend Internship Sprint",
    summary: "Eight weeks to a portfolio that survives a screening call.",
    weeklyPlan: [
      { week: 1, focus: "TypeScript fundamentals", objectives: ["Type an API client."] },
      { week: 2, focus: "React data fetching", objectives: ["Build a loading state."] },
      { week: 3, focus: "Accessibility", objectives: ["Audit one page."] },
    ],
    recommendedSkills: [{ name: "TypeScript", reason: "Every listing asks for it." }],
    miniProjects: [{ title: "Expense tracker", description: "CRUD with optimistic updates." }],
    milestones: [{ week: 2, title: "First case study drafted" }],
    mistakesToAvoid: ["Starting a fourth project before finishing the third."],
    nextSteps: ["Apply to five listings."],
    ...overrides,
  };
}

function storedRoadmap(overrides: Record<string, unknown> = {}) {
  return {
    id: "roadmap-1",
    userId: OWNER,
    goal: "Become internship ready",
    targetRole: "Frontend Developer Intern",
    duration: "8 weeks",
    currentSkills: ["React"],
    content: validContent(),
    completedWeeks: [],
    createdAt: new Date("2026-08-28T10:00:00.000Z"),
    ...overrides,
  };
}

function geminiReturns(payload: unknown) {
  generateContentMock.mockResolvedValue({
    text: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.roadmap.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
    Promise.resolve(storedRoadmap(data)),
  );
});

describe("generateRoadmap", () => {
  it("persists the generated content against the requesting user", async () => {
    geminiReturns(validContent());

    await roadmapService.generateRoadmap(OWNER, {
      goal: "Become internship ready",
      targetRole: "Frontend Developer Intern",
      duration: "8 weeks",
      currentSkills: ["React"],
    });

    const { data } = prismaMock.roadmap.create.mock.calls[0][0];
    expect(data.userId).toBe(OWNER);
    expect(data.goal).toBe("Become internship ready");
    expect(data.completedWeeks).toEqual([]);
    expect((data.content as { title: string }).title).toBe("Frontend Internship Sprint");
  });

  it("sends the user's inputs to the model", async () => {
    geminiReturns(validContent());

    await roadmapService.generateRoadmap(OWNER, {
      goal: "Land a backend internship",
      targetRole: "Backend Intern",
      duration: "6 weeks",
      currentSkills: ["Node", "SQL"],
    });

    const prompt = generateContentMock.mock.calls[0][0].contents as string;
    expect(prompt).toContain("Land a backend internship");
    expect(prompt).toContain("Backend Intern");
    expect(prompt).toContain("6 weeks");
    expect(prompt).toContain("Node, SQL");
  });

  it("asks for structured output rather than parsing prose", async () => {
    geminiReturns(validContent());

    await roadmapService.generateRoadmap(OWNER, {
      goal: "g",
      targetRole: "r",
      duration: "d",
    });

    const { config } = generateContentMock.mock.calls[0][0];
    expect(config.responseMimeType).toBe("application/json");
    expect(config.responseJsonSchema).toBeDefined();
  });

  it("rejects model output that does not match the schema instead of storing it", async () => {
    // A missing section would render as a blank panel forever once written to
    // the Json column, so it must fail at the boundary.
    geminiReturns(validContent({ weeklyPlan: [] }));

    await expect(
      roadmapService.generateRoadmap(OWNER, { goal: "g", targetRole: "r", duration: "d" }),
    ).rejects.toBeInstanceOf(ServiceUnavailableError);

    expect(prismaMock.roadmap.create).not.toHaveBeenCalled();
  });

  it("rejects unparseable output", async () => {
    geminiReturns("not json at all");

    await expect(
      roadmapService.generateRoadmap(OWNER, { goal: "g", targetRole: "r", duration: "d" }),
    ).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it("rejects an empty response", async () => {
    generateContentMock.mockResolvedValue({ text: "" });

    await expect(
      roadmapService.generateRoadmap(OWNER, { goal: "g", targetRole: "r", duration: "d" }),
    ).rejects.toBeInstanceOf(ServiceUnavailableError);
  });

  it("reports free-tier quota exhaustion as unavailable, not as a server bug", async () => {
    // The expected failure mode on the free tier. A 500 here would send the
    // user looking for a mistake in their own input.
    const quotaError = Object.assign(new Error("RESOURCE_EXHAUSTED"), { status: 429 });
    generateContentMock.mockRejectedValue(quotaError);

    const error = await roadmapService
      .generateRoadmap(OWNER, { goal: "g", targetRole: "r", duration: "d" })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ServiceUnavailableError);
    expect((error as Error).message).toMatch(/request limit/i);
  });

  it("does not leak raw model errors to the client", async () => {
    generateContentMock.mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.1:443"));

    const error = await roadmapService
      .generateRoadmap(OWNER, { goal: "g", targetRole: "r", duration: "d" })
      .catch((e: unknown) => e);

    expect((error as Error).message).not.toContain("ECONNREFUSED");
  });
});

describe("step status derivation", () => {
  it("marks the earliest outstanding week active and the rest planned", async () => {
    prismaMock.roadmap.findMany.mockResolvedValue([storedRoadmap({ completedWeeks: [1] })]);

    const [roadmap] = await roadmapService.getRoadmaps(OWNER);

    expect(roadmap.steps.map((step) => step.status)).toEqual([
      "completed",
      "active",
      "planned",
    ]);
  });

  it("leaves nothing active once every week is ticked", async () => {
    prismaMock.roadmap.findMany.mockResolvedValue([
      storedRoadmap({ completedWeeks: [1, 2, 3] }),
    ]);

    const [roadmap] = await roadmapService.getRoadmaps(OWNER);

    expect(roadmap.steps.every((step) => step.status === "completed")).toBe(true);
  });

  it("does not treat a later completed week as making earlier ones done", async () => {
    // Ticking week 3 first must not silently mark 1 and 2 complete.
    prismaMock.roadmap.findMany.mockResolvedValue([storedRoadmap({ completedWeeks: [3] })]);

    const [roadmap] = await roadmapService.getRoadmaps(OWNER);

    expect(roadmap.steps.map((step) => step.status)).toEqual([
      "active",
      "planned",
      "completed",
    ]);
  });

  it("orders steps by week even if the model returned them shuffled", async () => {
    const shuffled = validContent({
      weeklyPlan: [
        { week: 3, focus: "C", objectives: ["c"] },
        { week: 1, focus: "A", objectives: ["a"] },
        { week: 2, focus: "B", objectives: ["b"] },
      ],
    });
    prismaMock.roadmap.findMany.mockResolvedValue([storedRoadmap({ content: shuffled })]);

    const [roadmap] = await roadmapService.getRoadmaps(OWNER);

    expect(roadmap.steps.map((step) => step.week)).toEqual([1, 2, 3]);
  });

  it("degrades to an empty plan rather than throwing on an unreadable stored row", async () => {
    // One corrupt row must not take down the whole roadmap list.
    prismaMock.roadmap.findMany.mockResolvedValue([
      storedRoadmap({ content: { junk: true }, goal: "Fallback goal" }),
    ]);

    const [roadmap] = await roadmapService.getRoadmaps(OWNER);

    expect(roadmap.steps).toEqual([]);
    expect(roadmap.title).toBe("Fallback goal");
  });
});

describe("setWeekCompletion", () => {
  beforeEach(() => {
    prismaMock.roadmap.findFirst.mockResolvedValue(storedRoadmap());
    prismaMock.roadmap.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(storedRoadmap(data)),
    );
  });

  it("adds a week and keeps the list sorted", async () => {
    prismaMock.roadmap.findFirst.mockResolvedValue(storedRoadmap({ completedWeeks: [3] }));

    await roadmapService.setWeekCompletion(OWNER, "roadmap-1", 1, true);

    expect(prismaMock.roadmap.update.mock.calls[0][0].data.completedWeeks).toEqual([1, 3]);
  });

  it("removes a week when unticked", async () => {
    prismaMock.roadmap.findFirst.mockResolvedValue(storedRoadmap({ completedWeeks: [1, 2] }));

    await roadmapService.setWeekCompletion(OWNER, "roadmap-1", 1, false);

    expect(prismaMock.roadmap.update.mock.calls[0][0].data.completedWeeks).toEqual([2]);
  });

  it("is idempotent — ticking an already-complete week does not duplicate it", async () => {
    prismaMock.roadmap.findFirst.mockResolvedValue(storedRoadmap({ completedWeeks: [2] }));

    await roadmapService.setWeekCompletion(OWNER, "roadmap-1", 2, true);

    expect(prismaMock.roadmap.update.mock.calls[0][0].data.completedWeeks).toEqual([2]);
  });

  it("rejects a week the plan does not contain", async () => {
    await expect(
      roadmapService.setWeekCompletion(OWNER, "roadmap-1", 99, true),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(prismaMock.roadmap.update).not.toHaveBeenCalled();
  });

  it("refuses to touch another user's roadmap", async () => {
    prismaMock.roadmap.findFirst.mockResolvedValue(null);

    await expect(
      roadmapService.setWeekCompletion("someone-else", "roadmap-1", 1, true),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("scopes the ownership lookup to the caller", async () => {
    await roadmapService.setWeekCompletion(OWNER, "roadmap-1", 1, true);

    expect(prismaMock.roadmap.findFirst.mock.calls[0][0].where).toEqual({
      id: "roadmap-1",
      userId: OWNER,
    });
  });
});

describe("deleteRoadmap", () => {
  it("refuses to delete a roadmap belonging to another user", async () => {
    prismaMock.roadmap.findFirst.mockResolvedValue(null);

    await expect(roadmapService.deleteRoadmap("someone-else", "roadmap-1")).rejects.toBeInstanceOf(
      NotFoundError,
    );

    expect(prismaMock.roadmap.delete).not.toHaveBeenCalled();
  });
});
