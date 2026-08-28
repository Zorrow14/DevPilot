import type { ReadinessBreakdown } from "@/src/lib/api";
import type { Project, Roadmap, Skill, Task } from "@/src/types";

/**
 * Chart data derivation.
 *
 * Kept as pure functions rather than inline inside the chart components so the
 * numbers can be tested directly — a chart that renders is not the same as a
 * chart that is correct, and asserting on SVG proves neither.
 */

export type CategoryDatum = { category: string; average: number; count: number };
export type SliceDatum = { name: string; value: number };
export type ReadinessDatum = { component: string; score: number };

function averageProgress(items: { progress: number }[]) {
  if (items.length === 0) {
    return 0;
  }

  const total = items.reduce((sum, item) => sum + Math.min(Math.max(item.progress, 0), 100), 0);

  return Math.round(total / items.length);
}

/**
 * Average skill progress per category, busiest first.
 *
 * Uses the user's own categories rather than the scorer's four core areas —
 * this chart is about where their effort actually goes, which the fixed list
 * would hide.
 */
export function skillsByCategory(skills: Skill[]): CategoryDatum[] {
  const groups = new Map<string, Skill[]>();

  for (const skill of skills) {
    const key = skill.category.trim() || "Uncategorised";
    const existing = groups.get(key);

    if (existing) {
      existing.push(skill);
    } else {
      groups.set(key, [skill]);
    }
  }

  return [...groups.entries()]
    .map(([category, items]) => ({
      category,
      average: averageProgress(items),
      count: items.length,
    }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

/** Project counts by status. Zero-count statuses are dropped so no empty slice is drawn. */
export function projectsByStatus(projects: Project[]): SliceDatum[] {
  const order: Project["status"][] = ["planning", "in-progress", "completed"];
  const labels: Record<Project["status"], string> = {
    planning: "Planning",
    "in-progress": "In progress",
    completed: "Completed",
  };

  return order
    .map((status) => ({
      name: labels[status],
      value: projects.filter((project) => project.status === status).length,
    }))
    .filter((slice) => slice.value > 0);
}

export function tasksByStatus(tasks: Task[]): SliceDatum[] {
  const order: Task["status"][] = ["todo", "in-progress", "done"];
  const labels: Record<Task["status"], string> = {
    todo: "To do",
    "in-progress": "In progress",
    done: "Done",
  };

  return order
    .map((status) => ({
      name: labels[status],
      value: tasks.filter((task) => task.status === status).length,
    }))
    .filter((slice) => slice.value > 0);
}

/** The five weighted components behind the overall readiness score. */
export function readinessComponents(readiness: ReadinessBreakdown): ReadinessDatum[] {
  return [
    { component: "Skills", score: readiness.skills },
    { component: "Projects", score: readiness.projects },
    { component: "Tasks", score: readiness.tasks },
    { component: "Coverage", score: readiness.coverage },
    { component: "Roadmap", score: readiness.roadmap },
  ];
}

/** Depth per core stack area, as the README's per-category readiness. */
export function readinessCategories(readiness: ReadinessBreakdown): ReadinessDatum[] {
  return [
    { component: "Frontend", score: readiness.categories.frontend },
    { component: "Backend", score: readiness.categories.backend },
    { component: "Database", score: readiness.categories.database },
    { component: "Deployment", score: readiness.categories.deployment },
  ];
}

export type RoadmapProgressDatum = {
  name: string;
  completed: number;
  remaining: number;
};

/**
 * Completed vs remaining weeks per roadmap, newest last so the bars read
 * left-to-right in the order the plans were made. Roadmaps whose stored body
 * could not be parsed have no weeks to show and are dropped.
 */
export function roadmapProgress(roadmaps: Roadmap[]): RoadmapProgressDatum[] {
  return roadmaps
    .filter((roadmap) => roadmap.steps.length > 0)
    .map((roadmap) => {
      const total = roadmap.steps.length;
      const completed = Math.min(roadmap.completedWeeks.length, total);

      return {
        name: roadmap.targetRole || roadmap.title,
        completed,
        remaining: total - completed,
      };
    })
    .reverse();
}

/** Overall share of planned weeks completed, matching the readiness component. */
export function roadmapCompletionRate(roadmaps: Roadmap[]) {
  const totals = roadmaps.reduce(
    (acc, roadmap) => {
      const total = roadmap.steps.length;

      return {
        completed: acc.completed + Math.min(roadmap.completedWeeks.length, total),
        total: acc.total + total,
      };
    },
    { completed: 0, total: 0 },
  );

  if (totals.total === 0) {
    return 0;
  }

  return Math.round((totals.completed / totals.total) * 100);
}
