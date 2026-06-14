"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { AnnouncementPanel } from "@/src/components/dashboard/AnnouncementPanel";
import { DashboardStats } from "@/src/components/dashboard/DashboardStats";
import { RecentRoadmaps } from "@/src/components/dashboard/RecentRoadmaps";
import { UpcomingTasks } from "@/src/components/dashboard/UpcomingTasks";
import { api, type DashboardStatsResponse } from "@/src/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setData(await api.getDashboardStats());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  return (
    <AppShell
      title={`Welcome back${data ? `, ${data.user.name.split(" ")[0]}` : ""}`}
      description="Your mock workspace for skills, projects, roadmaps, tasks, and readiness tracking."
    >
      {isLoading ? (
        <Card>Loading dashboard data...</Card>
      ) : error ? (
        <EmptyState title="Dashboard unavailable" description={error} />
      ) : data ? (
        <>
      <DashboardStats
            skills={data.skills}
            projects={data.projects}
            tasks={data.tasks}
            user={data.user}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Progress Overview
            </h2>
            <Badge tone="indigo">Mock data</Badge>
          </div>
          <div className="space-y-5">
                {data.projects.map((project) => (
              <div key={project.id}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {project.title}
                  </p>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {project.progress}%
                  </span>
                </div>
                <ProgressBar value={project.progress} />
              </div>
            ))}
          </div>
        </Card>

            <UpcomingTasks tasks={data.tasks} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {data.roadmaps[0] ? <RecentRoadmaps roadmap={data.roadmaps[0]} /> : null}
            {data.announcements[0] ? (
              <AnnouncementPanel announcement={data.announcements[0]} />
            ) : null}
      </div>
        </>
      ) : null}
    </AppShell>
  );
}
