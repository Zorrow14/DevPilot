import { StatCard } from "@/src/components/ui/StatCard";
import type { Feedback, Project, Skill, User } from "@/src/types";

type AdminStatsProps = {
  users: User[];
  projects: Project[];
  skills: Skill[];
  feedback: Feedback[];
};

export function AdminStats({ users, projects, skills, feedback }: AdminStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Users" value={users.length} tone="beacon" />
      <StatCard label="Projects" value={projects.length} tone="heading" />
      <StatCard label="Skills tracked" value={skills.length} tone="nominal" />
      <StatCard
        label="Open feedback"
        value={
          // Anything not yet triaged to a terminal state — the queue an admin
          // still has to work through.
          feedback.filter((item) => item.status === "new" || item.status === "in-review").length
        }
        tone="alert"
      />
    </div>
  );
}
