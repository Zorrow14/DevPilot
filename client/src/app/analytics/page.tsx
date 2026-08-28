"use client";

import { useMemo } from "react";

import {
  CategoryDepthChart,
  ProjectStatusChart,
  ReadinessRadar,
  RoadmapProgressChart,
  SkillCategoryChart,
  TaskStatusChart,
} from "@/src/components/analytics/AnalyticsCharts";
import { AppShell } from "@/src/components/layout/AppShell";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { StatCard } from "@/src/components/ui/StatCard";
import { useApiResource } from "@/src/hooks/useApiResource";
import {
  projectsByStatus,
  readinessCategories,
  readinessComponents,
  roadmapCompletionRate,
  roadmapProgress,
  skillsByCategory,
  tasksByStatus,
} from "@/src/lib/analytics";
import { api } from "@/src/lib/api";

export default function AnalyticsPage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getDashboardStats(signal));

  // Derived from the dashboard payload rather than a second endpoint: it
  // already carries every collection these charts plot, and a separate request
  // could disagree with the numbers on the dashboard itself.
  const charts = useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      skills: skillsByCategory(data.skills),
      projects: projectsByStatus(data.projects),
      tasks: tasksByStatus(data.tasks),
      components: readinessComponents(data.readiness),
      categories: readinessCategories(data.readiness),
      roadmaps: roadmapProgress(data.roadmaps),
      roadmapRate: roadmapCompletionRate(data.roadmaps),
    };
  }, [data]);

  const completedTasks = data?.tasks.filter((task) => task.completed).length ?? 0;

  return (
    <AppShell
      title="Analytics"
      description="How your skills, projects, tasks, and roadmaps are actually progressing."
    >
      {isLoading ? (
        <Card>Loading analytics...</Card>
      ) : error ? (
        <EmptyState title="Analytics unavailable" description={error} />
      ) : data && charts ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Readiness"
              value={`${data.readiness.overall}%`}
              helper="Weighted across five components"
              tone="beacon"
            />
            <StatCard
              label="Skills tracked"
              value={data.skills.length}
              helper={`${charts.skills.length} categories`}
              tone="heading"
            />
            <StatCard
              label="Tasks completed"
              value={`${completedTasks} / ${data.tasks.length}`}
              helper={`${data.projects.length} projects`}
              tone="nominal"
            />
            <StatCard
              label="Roadmap weeks done"
              value={`${charts.roadmapRate}%`}
              helper={`${data.roadmaps.length} roadmap(s)`}
              tone={charts.roadmapRate > 0 ? "nominal" : "alert"}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ReadinessRadar data={charts.components} />
            <CategoryDepthChart data={charts.categories} />
            <SkillCategoryChart data={charts.skills} />
            <RoadmapProgressChart data={charts.roadmaps} />
            <ProjectStatusChart data={charts.projects} />
            <TaskStatusChart data={charts.tasks} />
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
