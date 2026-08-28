import type { Project, Skill, Task } from "@prisma/client";

/**
 * Weighted internship-readiness score over a user's tracked work.
 *
 * Each component is a 0-100 percentage and contributes by weight. A user with no
 * data scores 0 rather than being excused from a component — an empty workspace
 * genuinely is not internship-ready.
 */
const WEIGHTS = {
  skills: 0.25,
  projects: 0.25,
  tasks: 0.2,
  coverage: 0.15,
  // Follow-through on a generated plan, not the act of generating one.
  // Deliberately the joint-smallest weight: it is evidence of consistency
  // rather than of capability, and it is the only component a user can move
  // without building anything.
  roadmap: 0.15,
} as const;

/** The stack areas an internship candidate is expected to have touched. */
export const CORE_CATEGORIES = ["frontend", "backend", "database", "deployment"] as const;

export type CoreCategory = (typeof CORE_CATEGORIES)[number];

export type ReadinessBreakdown = {
  overall: number;
  skills: number;
  projects: number;
  tasks: number;
  coverage: number;
  roadmap: number;
  /**
   * Average skill progress within each core area — depth, where `coverage`
   * measures breadth. An area with no skills scores 0, which is the honest
   * reading: nothing tracked there.
   */
  categories: Record<CoreCategory, number>;
};

export type ReadinessInput = {
  skills: Pick<Skill, "category" | "progress">[];
  projects: Pick<Project, "status">[];
  tasks: Pick<Task, "status">[];
  /**
   * Pre-resolved plan progress. The caller supplies week counts rather than
   * raw rows so this stays a pure function — parsing the roadmap's Json body is
   * the roadmap service's job, and it owns the schema that defines it.
   */
  roadmaps?: { completedWeeks: number; totalWeeks: number }[];
};

function toPercent(value: number) {
  return Math.round(Math.min(Math.max(value, 0), 100));
}

/** Guards against a bad stored progress skewing an average past 100. */
function clampProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 100);
}

function normalizeCategory(category: string) {
  return category.trim().toLowerCase();
}

function averageSkillProgress(skills: ReadinessInput["skills"]) {
  if (skills.length === 0) {
    return 0;
  }

  return skills.reduce((total, skill) => total + clampProgress(skill.progress), 0) / skills.length;
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
      .map((skill) => normalizeCategory(skill.category))
      .filter((category) => (CORE_CATEGORIES as readonly string[]).includes(category)),
  );

  return (covered.size / CORE_CATEGORIES.length) * 100;
}

function categoryScores(skills: ReadinessInput["skills"]): Record<CoreCategory, number> {
  const scores = {} as Record<CoreCategory, number>;

  for (const category of CORE_CATEGORIES) {
    const matching = skills.filter((skill) => normalizeCategory(skill.category) === category);
    scores[category] = toPercent(averageSkillProgress(matching));
  }

  return scores;
}

/**
 * Share of planned weeks actually ticked off, across every roadmap.
 *
 * Pooled rather than averaged per roadmap so a short abandoned plan cannot
 * outweigh a long one being worked through. A roadmap with no readable plan
 * contributes nothing rather than counting as complete.
 */
function roadmapActivity(roadmaps: ReadinessInput["roadmaps"]) {
  if (!roadmaps || roadmaps.length === 0) {
    return 0;
  }

  const totals = roadmaps.reduce(
    (acc, roadmap) => ({
      completed: acc.completed + Math.min(roadmap.completedWeeks, roadmap.totalWeeks),
      total: acc.total + roadmap.totalWeeks,
    }),
    { completed: 0, total: 0 },
  );

  if (totals.total === 0) {
    return 0;
  }

  return (totals.completed / totals.total) * 100;
}

export function calculateReadinessScore({
  skills,
  projects,
  tasks,
  roadmaps,
}: ReadinessInput): ReadinessBreakdown {
  const skillScore = toPercent(averageSkillProgress(skills));
  const projectScore = toPercent(
    completionRate(projects, (project) => project.status === "COMPLETED"),
  );
  const taskScore = toPercent(completionRate(tasks, (task) => task.status === "COMPLETED"));
  const coverageScore = toPercent(categoryCoverage(skills));
  const roadmapScore = toPercent(roadmapActivity(roadmaps));

  return {
    overall: toPercent(
      skillScore * WEIGHTS.skills +
        projectScore * WEIGHTS.projects +
        taskScore * WEIGHTS.tasks +
        coverageScore * WEIGHTS.coverage +
        roadmapScore * WEIGHTS.roadmap,
    ),
    skills: skillScore,
    projects: projectScore,
    tasks: taskScore,
    coverage: coverageScore,
    roadmap: roadmapScore,
    categories: categoryScores(skills),
  };
}
