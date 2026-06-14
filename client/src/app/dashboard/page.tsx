import { AppShell } from "@/src/components/layout/AppShell";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { AnnouncementPanel } from "@/src/components/dashboard/AnnouncementPanel";
import { DashboardStats } from "@/src/components/dashboard/DashboardStats";
import { RecentRoadmaps } from "@/src/components/dashboard/RecentRoadmaps";
import { UpcomingTasks } from "@/src/components/dashboard/UpcomingTasks";
import {
  mockAnnouncements,
  mockProjects,
  mockRoadmaps,
  mockSkills,
  mockTasks,
  mockUser,
} from "@/src/data/mockData";

export default function DashboardPage() {
  const recentRoadmap = mockRoadmaps[0];
  const announcement = mockAnnouncements[0];

  return (
    <AppShell
      title={`Welcome back, ${mockUser.name.split(" ")[0]}`}
      description="Your mock workspace for skills, projects, roadmaps, tasks, and readiness tracking."
    >
      <DashboardStats
        skills={mockSkills}
        projects={mockProjects}
        tasks={mockTasks}
        user={mockUser}
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
            {mockProjects.map((project) => (
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

        <UpcomingTasks tasks={mockTasks} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentRoadmaps roadmap={recentRoadmap} />
        <AnnouncementPanel announcement={announcement} />
      </div>
    </AppShell>
  );
}
