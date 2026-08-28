import { describe, expect, it } from "vitest";

import {
  projectsByStatus,
  readinessCategories,
  readinessComponents,
  roadmapCompletionRate,
  roadmapProgress,
  skillsByCategory,
  tasksByStatus,
} from "./analytics";
import type { ReadinessBreakdown } from "./api";
import type { Project, Roadmap, Skill, Task } from "@/src/types";

function skill(category: string, progress: number, id = category + progress): Skill {
  return {
    id,
    name: `${category} skill`,
    category,
    level: "beginner",
    progress,
    lastPracticed: "",
    notes: null,
  };
}

function project(status: Project["status"], id = status): Project {
  return {
    id,
    title: "Project",
    description: "",
    techStack: [],
    status,
    priority: "medium",
    deadline: "",
    progress: 0,
  };
}

function task(status: Task["status"], id = status): Task {
  return {
    id,
    projectId: "p1",
    title: "Task",
    description: "",
    status,
    priority: "medium",
    dueDate: "",
    completed: status === "done",
  };
}

function roadmap(weeks: number, completed: number[], id = "r1", targetRole = "Frontend"): Roadmap {
  return {
    id,
    goal: "goal",
    targetRole,
    duration: `${weeks} weeks`,
    currentSkills: [],
    completedWeeks: completed,
    createdAt: "2026-08-01",
    title: "Plan",
    description: "",
    steps: Array.from({ length: weeks }, (_, index) => ({
      id: `week-${index + 1}`,
      week: index + 1,
      title: `Week ${index + 1}`,
      description: "",
      duration: "1 week",
      status: "planned" as const,
    })),
    content: null,
  };
}

describe("skillsByCategory", () => {
  it("averages progress within each category", () => {
    const data = skillsByCategory([
      skill("Frontend", 40, "a"),
      skill("Frontend", 60, "b"),
      skill("Backend", 90, "c"),
    ]);

    expect(data).toEqual([
      { category: "Frontend", average: 50, count: 2 },
      { category: "Backend", average: 90, count: 1 },
    ]);
  });

  it("orders by how many skills a category holds", () => {
    const data = skillsByCategory([
      skill("Backend", 10, "a"),
      skill("Frontend", 10, "b"),
      skill("Frontend", 20, "c"),
    ]);

    expect(data[0].category).toBe("Frontend");
  });

  it("keeps the user's own categories rather than the scorer's core four", () => {
    // This chart shows where effort actually goes; restricting it to the core
    // list would hide everything else the user tracks.
    const data = skillsByCategory([skill("Design", 70)]);

    expect(data).toEqual([{ category: "Design", average: 70, count: 1 }]);
  });

  it("labels a blank category rather than rendering an empty axis tick", () => {
    const data = skillsByCategory([skill("   ", 50)]);

    expect(data[0].category).toBe("Uncategorised");
  });

  it("clamps a bad stored progress so a bar cannot exceed the axis", () => {
    const data = skillsByCategory([skill("Frontend", 400)]);

    expect(data[0].average).toBe(100);
  });

  it("returns nothing for an empty skill list", () => {
    expect(skillsByCategory([])).toEqual([]);
  });
});

describe("projectsByStatus / tasksByStatus", () => {
  it("counts projects per status in a fixed order", () => {
    const data = projectsByStatus([
      project("completed", "a"),
      project("planning", "b"),
      project("completed", "c"),
    ]);

    expect(data).toEqual([
      { name: "Planning", value: 1 },
      { name: "Completed", value: 2 },
    ]);
  });

  it("drops statuses with no items so no empty slice is drawn", () => {
    const data = projectsByStatus([project("planning")]);

    expect(data).toEqual([{ name: "Planning", value: 1 }]);
  });

  it("counts tasks per status", () => {
    const data = tasksByStatus([task("done", "a"), task("todo", "b"), task("done", "c")]);

    expect(data).toEqual([
      { name: "To do", value: 1 },
      { name: "Done", value: 2 },
    ]);
  });

  it("returns nothing when there is nothing to plot", () => {
    expect(projectsByStatus([])).toEqual([]);
    expect(tasksByStatus([])).toEqual([]);
  });
});

describe("readiness chart data", () => {
  const readiness: ReadinessBreakdown = {
    overall: 61,
    skills: 100,
    projects: 100,
    tasks: 0,
    coverage: 25,
    roadmap: 50,
    categories: { frontend: 100, backend: 0, database: 0, deployment: 0 },
  };

  it("plots all five weighted components", () => {
    const data = readinessComponents(readiness);

    expect(data.map((entry) => entry.component)).toEqual([
      "Skills",
      "Projects",
      "Tasks",
      "Coverage",
      "Roadmap",
    ]);
    expect(data.find((entry) => entry.component === "Roadmap")?.score).toBe(50);
  });

  it("plots the four core stack areas", () => {
    const data = readinessCategories(readiness);

    expect(data).toEqual([
      { component: "Frontend", score: 100 },
      { component: "Backend", score: 0 },
      { component: "Database", score: 0 },
      { component: "Deployment", score: 0 },
    ]);
  });
});

describe("roadmapProgress", () => {
  it("splits each plan into completed and remaining weeks", () => {
    const data = roadmapProgress([roadmap(4, [1, 2])]);

    expect(data).toEqual([{ name: "Frontend", completed: 2, remaining: 2 }]);
  });

  it("drops a roadmap whose stored plan could not be read", () => {
    // steps is empty when the Json body failed validation server-side; a bar of
    // height zero would imply a plan with no weeks.
    const unreadable = { ...roadmap(0, []), steps: [] };

    expect(roadmapProgress([unreadable])).toEqual([]);
  });

  it("never reports negative remaining weeks", () => {
    // A plan shortened after weeks were ticked would otherwise stack below zero.
    const data = roadmapProgress([roadmap(2, [1, 2, 3, 4])]);

    expect(data[0]).toEqual({ name: "Frontend", completed: 2, remaining: 0 });
  });

  it("falls back to the roadmap title when no target role is set", () => {
    const data = roadmapProgress([{ ...roadmap(2, []), targetRole: "" }]);

    expect(data[0].name).toBe("Plan");
  });

  it("reverses the API's newest-first order so bars read oldest to newest", () => {
    const data = roadmapProgress([
      roadmap(2, [], "new", "Newer"),
      roadmap(2, [], "old", "Older"),
    ]);

    expect(data.map((entry) => entry.name)).toEqual(["Older", "Newer"]);
  });
});

describe("roadmapCompletionRate", () => {
  it("pools weeks across roadmaps rather than averaging per roadmap", () => {
    // Matches the server's readiness component: 1 of 16 weeks, not 50%.
    const rate = roadmapCompletionRate([
      roadmap(1, [1], "a"),
      roadmap(15, [], "b"),
    ]);

    expect(rate).toBe(6);
  });

  it("returns zero rather than NaN when there are no roadmaps", () => {
    expect(roadmapCompletionRate([])).toBe(0);
  });

  it("returns zero when no roadmap has a readable plan", () => {
    expect(roadmapCompletionRate([{ ...roadmap(0, []), steps: [] }])).toBe(0);
  });
});
