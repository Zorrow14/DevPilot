import { describe, expect, it } from "vitest";

import { calculateReadinessScore, type ReadinessInput } from "./calculateReadinessScore";

/**
 * The weights (skills .30 / projects .30 / tasks .25 / coverage .15) are a
 * product decision, so these tests pin the arithmetic rather than restating the
 * constants — if a weight changes, the expected overall changes with it and the
 * failure is a deliberate prompt to re-check the intent.
 */

function skill(category: string, progress: number): ReadinessInput["skills"][number] {
  return { category, progress };
}

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
    });

    expect(result).toEqual({
      overall: 100,
      skills: 100,
      projects: 100,
      tasks: 100,
      coverage: 100,
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
    });

    // 100*.30 + 100*.30 + 0*.25 + 25*.15 = 63.75 -> 64
    expect(result.overall).toBe(64);
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
    expect(result.overall).toBeLessThanOrEqual(100);
  });
});
