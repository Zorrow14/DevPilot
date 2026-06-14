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
      <StatCard label="Users" value={users.length} />
      <StatCard label="Projects" value={projects.length} />
      <StatCard label="Skills Tracked" value={skills.length} />
      <StatCard
        label="Open Feedback"
        value={feedback.filter((item) => item.status === "open").length}
      />
    </div>
  );
}
