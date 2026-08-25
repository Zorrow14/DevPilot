import type { Project, Skill, Task } from "@prisma/client";

/**
 * Weighted internship-readiness score over a user's tracked work.
 *
 * Each component is a 0-100 percentage and contributes by weight. A user with no
 * data scores 0 rather than being excused from a component — an empty workspace
 * genuinely is not internship-ready.
 */
const WEIGHTS = {
  skills: 0.3,
  projects: 0.3,
  tasks: 0.25,
  coverage: 0.15,
} as const;

/** The stack areas an internship candidate is expected to have touched. */
const CORE_CATEGORIES = ["frontend", "backend", "database", "deployment"];

export type ReadinessBreakdown = {
  overall: number;
  skills: number;
  projects: number;
  tasks: number;
  coverage: number;
};

export type ReadinessInput = {
  skills: Pick<Skill, "category" | "progress">[];
  projects: Pick<Project, "status">[];
  tasks: Pick<Task, "status">[];
};

function toPercent(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 100));
}

function averageSkillProgress(skills: ReadinessInput["skills"]) {
  if (skills.length === 0) {
    return 0;
  }

  return skills.reduce((total, skill) => total + skill.progress, 0) / skills.length;
}

function completionRate<T>(items: T[], isComplete: (item: T) => boolean) {
  if (items.length === 0) {
    return 0;
  }

  return (items.filter(isComplete).length / items.length) * 100;
}

function categoryCoverage(skills: ReadinessInput["skills"]) {
  const covered = new Set(
    skills
      .map((skill) => skill.category.trim().toLowerCase())
      .filter((category) => CORE_CATEGORIES.includes(category)),
  );

  return (covered.size / CORE_CATEGORIES.length) * 100;
}

export function calculateReadinessScore({
  skills,
  projects,
  tasks,
}: ReadinessInput): ReadinessBreakdown {
  const skillScore = toPercent(averageSkillProgress(skills));
  const projectScore = toPercent(
    completionRate(projects, (project) => project.status === "COMPLETED"),
  );
  const taskScore = toPercent(completionRate(tasks, (task) => task.status === "COMPLETED"));
  const coverageScore = toPercent(categoryCoverage(skills));

  return {
    overall: toPercent(
      skillScore * WEIGHTS.skills +
        projectScore * WEIGHTS.projects +
        taskScore * WEIGHTS.tasks +
        coverageScore * WEIGHTS.coverage,
    ),
    skills: skillScore,
    projects: projectScore,
    tasks: taskScore,
    coverage: coverageScore,
  };
}
