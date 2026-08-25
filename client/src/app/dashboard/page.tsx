"use client";

import { AppShell } from "@/src/components/layout/AppShell";
import { BentoGrid } from "@/src/components/ui/BentoGrid";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { StatCard } from "@/src/components/ui/StatCard";
import { AnnouncementPanel } from "@/src/components/dashboard/AnnouncementPanel";
import { ProjectHealth } from "@/src/components/dashboard/ProjectHealth";
import { ReadinessCard } from "@/src/components/dashboard/ReadinessCard";
import { RecentRoadmaps } from "@/src/components/dashboard/RecentRoadmaps";
import { UpcomingTasks } from "@/src/components/dashboard/UpcomingTasks";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function DashboardPage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getDashboardStats(signal));

  const activeProjects = data?.projects.filter((project) => project.status === "in-progress") ?? [];
  const pendingTasks = data?.tasks.filter((task) => !task.completed) ?? [];

  return (
    <AppShell
      title={`Welcome back${data ? `, ${data.user.name.split(" ")[0]}` : ""}`}
      description="Your workspace for skills, projects, roadmaps, tasks, and readiness tracking."
    >
      {isLoading ? (
        <Card>Loading dashboard data...</Card>
      ) : error ? (
        <EmptyState title="Dashboard unavailable" description={error} />
      ) : data ? (
        <BentoGrid>
          {/* Anchor cell: full-height readiness instrument down the left. */}
          <ReadinessCard readiness={data.readiness} className="lg:col-span-4 lg:row-span-2" />

          <StatCard
            label="Skills tracked"
            value={data.skills.length}
            tone="heading"
            className="lg:col-span-4"
          />
          <StatCard
            label="Active projects"
            value={activeProjects.length}
            helper={`${data.projects.length} total`}
            tone="nominal"
            className="lg:col-span-4"
          />

          <ProjectHealth projects={data.projects} className="lg:col-span-8" />

          <UpcomingTasks tasks={data.tasks} className="lg:col-span-5" />

          <StatCard
            label="Pending tasks"
            value={pendingTasks.length}
            helper={`${data.tasks.length - pendingTasks.length} completed`}
            tone={pendingTasks.length > 0 ? "beacon" : "nominal"}
            className="lg:col-span-3"
          />

          {data.roadmaps[0] ? (
            <RecentRoadmaps roadmap={data.roadmaps[0]} className="lg:col-span-4" />
          ) : null}
          {data.announcements[0] ? (
            <AnnouncementPanel
              announcement={data.announcements[0]}
              className="lg:col-span-8"
            />
          ) : null}
        </BentoGrid>
      ) : null}
    </AppShell>
  );
}
