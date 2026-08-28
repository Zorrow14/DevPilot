import { describe, expect, it } from "vitest";

import { calculateReadinessScore, type ReadinessInput } from "./calculateReadinessScore";

/**
 * The weights (skills .25 / projects .25 / tasks .20 / coverage .15 /
 * roadmap .15) are a product decision, so these tests pin the arithmetic rather
 * than restating the constants — if a weight changes, the expected overall
 * changes with it and the failure is a deliberate prompt to re-check the intent.
 */

function skill(category: string, progress: number): ReadinessInput["skills"][number] {
  return { category, progress };
}

const NO_CATEGORIES = { frontend: 0, backend: 0, database: 0, deployment: 0 };

describe("calculateReadinessScore", () => {
  it("scores an empty workspace as zero across the board", () => {
    // An empty workspace genuinely is not internship-ready, so components are
    // floored at 0 rather than being excused from the average.
    expect(calculateReadinessScore({ skills: [], projects: [], tasks: [] })).toEqual({
      overall: 0,
      skills: 0,
      projects: 0,
      tasks: 0,
      coverage: 0,
      roadmap: 0,
      categories: NO_CATEGORIES,
    });
  });

  it("scores a fully complete workspace as 100", () => {
    const result = calculateReadinessScore({
      skills: [
        skill("frontend", 100),
        skill("backend", 100),
        skill("database", 100),
        skill("deployment", 100),
      ],
      projects: [{ status: "COMPLETED" }],
      tasks: [{ status: "COMPLETED" }],
      roadmaps: [{ completedWeeks: 4, totalWeeks: 4 }],
    });

    expect(result).toEqual({
      overall: 100,
      skills: 100,
      projects: 100,
      tasks: 100,
      coverage: 100,
      roadmap: 100,
      categories: { frontend: 100, backend: 100, database: 100, deployment: 100 },
    });
  });

  it("averages skill progress rather than summing it", () => {
    const result = calculateReadinessScore({
      skills: [skill("frontend", 20), skill("backend", 80)],
      projects: [],
      tasks: [],
    });

    expect(result.skills).toBe(50);
  });

  it("reports project and task scores as completion rates", () => {
    const result = calculateReadinessScore({
      skills: [],
      projects: [{ status: "COMPLETED" }, { status: "IN_PROGRESS" }, { status: "PLANNING" }],
      tasks: [{ status: "COMPLETED" }, { status: "TODO" }],
    });

    expect(result.projects).toBe(33); // 1 of 3, rounded
    expect(result.tasks).toBe(50); // 1 of 2
  });

  it("counts only the four core categories toward coverage, case-insensitively", () => {
    const result = calculateReadinessScore({
      skills: [skill("  FrontEnd  ", 50), skill("Backend", 50), skill("astrology", 100)],
      projects: [],
      tasks: [],
    });

    // frontend + backend of four core areas; the off-list category is ignored.
    expect(result.coverage).toBe(50);
  });

  it("does not double-count a category listed twice", () => {
    const result = calculateReadinessScore({
      skills: [skill("frontend", 10), skill("frontend", 90)],
      projects: [],
      tasks: [],
    });

    expect(result.coverage).toBe(25); // one of four core areas
  });

  it("combines components by weight", () => {
    const result = calculateReadinessScore({
      skills: [skill("frontend", 100)], // skills 100, coverage 25
      projects: [{ status: "COMPLETED" }], // 100
      tasks: [{ status: "TODO" }], // 0
      roadmaps: [{ completedWeeks: 2, totalWeeks: 4 }], // 50
    });

    // 100*.25 + 100*.25 + 0*.20 + 25*.15 + 50*.15 = 61.25 -> 61
    expect(result.overall).toBe(61);
  });

  it("treats non-completed statuses as incomplete", () => {
    const result = calculateReadinessScore({
      skills: [],
      projects: [{ status: "IN_PROGRESS" }, { status: "PLANNING" }],
      tasks: [{ status: "IN_PROGRESS" }, { status: "TODO" }],
    });

    expect(result.projects).toBe(0);
    expect(result.tasks).toBe(0);
    expect(result.overall).toBe(0);
  });

  it("clamps out-of-range stored progress instead of skewing the average", () => {
    // progress is an unconstrained Int in Postgres, so a bad write must not be
    // able to push the reported score above 100.
    const result = calculateReadinessScore({
      skills: [skill("frontend", 400)],
      projects: [],
      tasks: [],
    });

    expect(result.skills).toBe(100);
    expect(result.categories.frontend).toBe(100);
    expect(result.overall).toBeLessThanOrEqual(100);
  });
});

describe("roadmap activity", () => {
  it("scores zero when the user has no roadmaps", () => {
    // Generating nothing is not partial credit.
    expect(calculateReadinessScore({ skills: [], projects: [], tasks: [] }).roadmap).toBe(0);
  });

  it("scores zero for a generated roadmap with nothing ticked off", () => {
    // Generating a plan is one click; it is following it that counts.
    const result = calculateReadinessScore({
      skills: [],
      projects: [],
      tasks: [],
      roadmaps: [{ completedWeeks: 0, totalWeeks: 8 }],
    });

    expect(result.roadmap).toBe(0);
  });

  it("reports the share of planned weeks completed", () => {
    const result = calculateReadinessScore({
      skills: [],
      projects: [],
      tasks: [],
      roadmaps: [{ completedWeeks: 3, totalWeeks: 4 }],
    });

    expect(result.roadmap).toBe(75);
  });

  it("pools weeks across roadmaps rather than averaging per roadmap", () => {
    // Averaging per roadmap would let one finished 1-week plan cancel out an
    // untouched 15-week one. Pooled: 1 of 16 weeks done.
    const result = calculateReadinessScore({
      skills: [],
      projects: [],
      tasks: [],
      roadmaps: [
        { completedWeeks: 1, totalWeeks: 1 },
        { completedWeeks: 0, totalWeeks: 15 },
      ],
    });

    expect(result.roadmap).toBe(6); // 1/16 = 6.25 -> 6
  });

  it("ignores a roadmap whose plan could not be read", () => {
    // totalWeeks 0 means the stored body failed to parse; it must not count as
    // complete, and it must not divide by zero.
    const result = calculateReadinessScore({
      skills: [],
      projects: [],
      tasks: [],
      roadmaps: [{ completedWeeks: 0, totalWeeks: 0 }],
    });

    expect(result.roadmap).toBe(0);
  });

  it("cannot exceed 100 if more weeks are ticked than the plan contains", () => {
    // A plan shortened after weeks were ticked would otherwise report over 100.
    const result = calculateReadinessScore({
      skills: [],
      projects: [],
      tasks: [],
      roadmaps: [{ completedWeeks: 9, totalWeeks: 4 }],
    });

    expect(result.roadmap).toBe(100);
  });
});

describe("per-category readiness", () => {
  it("reports average progress within each core area", () => {
    const result = calculateReadinessScore({
      skills: [skill("Frontend", 40), skill("Frontend", 60), skill("Backend", 90)],
      projects: [],
      tasks: [],
    });

    expect(result.categories).toEqual({
      frontend: 50,
      backend: 90,
      database: 0,
      deployment: 0,
    });
  });

  it("distinguishes an untouched area from a tracked one at zero progress", () => {
    // Both read 0, which is intended — the difference is visible in `coverage`,
    // which counts the area as covered either way.
    const result = calculateReadinessScore({
      skills: [skill("database", 0)],
      projects: [],
      tasks: [],
    });

    expect(result.categories.database).toBe(0);
    expect(result.coverage).toBe(25);
  });

  it("ignores categories outside the core four", () => {
    const result = calculateReadinessScore({
      skills: [skill("Design", 100)],
      projects: [],
      tasks: [],
    });

    expect(result.categories).toEqual(NO_CATEGORIES);
  });

  it("matches categories case-insensitively and ignores surrounding space", () => {
    const result = calculateReadinessScore({
      skills: [skill("  DEPLOYMENT ", 80)],
      projects: [],
      tasks: [],
    });

    expect(result.categories.deployment).toBe(80);
  });
});
