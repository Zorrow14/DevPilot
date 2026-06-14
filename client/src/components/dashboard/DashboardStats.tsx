import { StatCard } from "@/src/components/ui/StatCard";
import type { Project, Skill, Task, User } from "@/src/types";

type DashboardStatsProps = {
  skills: Skill[];
  projects: Project[];
  tasks: Task[];
  user: User;
};

export function DashboardStats({
  skills,
  projects,
  tasks,
  user,
}: DashboardStatsProps) {
  const activeProjects = projects.filter((project) => project.status === "in-progress");
  const pendingTasks = tasks.filter((task) => !task.completed);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Skills" value={skills.length} />
      <StatCard label="Active Projects" value={activeProjects.length} />
      <StatCard label="Pending Tasks" value={pendingTasks.length} />
      <StatCard label="Readiness Score" value={`${user.readinessScore}%`} />
    </div>
  );
}
