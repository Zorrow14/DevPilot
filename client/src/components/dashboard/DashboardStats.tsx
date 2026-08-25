import { Card } from "@/src/components/ui/Card";
import { ReadinessGauge } from "@/src/components/ui/ReadinessGauge";
import type { Project, Skill, Task, User } from "@/src/types";

type DashboardStatsProps = {
  skills: Skill[];
  projects: Project[];
  tasks: Task[];
  user: User;
};

export function DashboardStats({ skills, projects, tasks, user }: DashboardStatsProps) {
  const activeProjects = projects.filter((project) => project.status === "in-progress");
  const pendingTasks = tasks.filter((task) => !task.completed);

  const readouts = [
    { label: "Total skills", value: skills.length },
    { label: "Active projects", value: activeProjects.length },
    { label: "Pending tasks", value: pendingTasks.length },
  ];

  return (
    <Card className="flex flex-col items-center gap-8 sm:flex-row">
      <ReadinessGauge value={user.readinessScore} size={128} />
      <div className="grid w-full grid-cols-3 divide-x divide-bezel border-t border-bezel pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
        {readouts.map((readout) => (
          <div key={readout.label} className="px-2 text-center sm:px-6">
            <p className="font-display text-3xl font-bold text-ink">{readout.value}</p>
            <p className="mt-1 font-display text-[0.6875rem] uppercase tracking-wider text-ink-dim">
              {readout.label}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
