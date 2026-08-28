import { StatCard } from "@/src/components/ui/StatCard";
import type { PlatformStats } from "@/src/lib/api";

type AdminStatsProps = {
  stats: PlatformStats;
};

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Users"
        value={stats.users}
        helper={`${stats.activeUsers} active · ${stats.admins} admin`}
        tone="beacon"
      />
      <StatCard
        label="Projects"
        value={stats.projects}
        helper={`${stats.completedProjects} completed`}
        tone="heading"
      />
      <StatCard
        label="Skills tracked"
        value={stats.skills}
        helper={`${stats.roadmaps} roadmaps generated`}
        tone="nominal"
      />
      <StatCard
        label="Open feedback"
        value={stats.openFeedback}
        helper={`${stats.completedTasks} / ${stats.tasks} tasks done`}
        tone="alert"
      />
    </div>
  );
}
