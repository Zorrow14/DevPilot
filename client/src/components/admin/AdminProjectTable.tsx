import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { Project } from "@/src/types";

type AdminProjectTableProps = {
  projects: Project[];
};

export function AdminProjectTable({ projects }: AdminProjectTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 pr-4 font-semibold">Project</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 pr-4 font-semibold">Priority</th>
              <th className="py-3 pr-4 font-semibold">Deadline</th>
              <th className="py-3 pr-4 font-semibold">Progress</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-700"
              >
                <td className="py-4 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                  {project.title}
                </td>
                <td className="py-4 pr-4">
                  <Badge tone="indigo">{project.status}</Badge>
                </td>
                <td className="py-4 pr-4">
                  <Badge tone={project.priority === "high" ? "rose" : "amber"}>
                    {project.priority}
                  </Badge>
                </td>
                <td className="py-4 pr-4">{project.deadline}</td>
                <td className="py-4 pr-4">
                  <div className="w-40">
                    <ProgressBar value={project.progress} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
