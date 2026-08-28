import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { Project } from "@/src/types";

type AdminProjectTableProps = {
  projects: Project[];
};

const statusTones = { planning: "neutral", "in-progress": "heading", completed: "nominal" } as const;
const priorityTones = { low: "neutral", medium: "beacon", high: "alert" } as const;

export function AdminProjectTable({ projects }: AdminProjectTableProps) {
  return (
    <Card className="overflow-hidden" elevation="flat">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-bezel">
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Project
              </th>
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Status
              </th>
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Priority
              </th>
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Deadline
              </th>
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-bezel last:border-0">
                <td className="py-4 pr-4 font-semibold text-ink">{project.title}</td>
                <td className="py-4 pr-4">
                  <Badge tone={statusTones[project.status]}>{project.status}</Badge>
                </td>
                <td className="py-4 pr-4">
                  <Badge tone={priorityTones[project.priority]}>{project.priority}</Badge>
                </td>
                <td className="py-4 pr-4 text-ink-dim">{project.deadline}</td>
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
