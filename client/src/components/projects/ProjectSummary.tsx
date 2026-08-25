import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { Project } from "@/src/types";

type ProjectSummaryProps = {
  project: Project;
};

const statusTones = { planning: "neutral", "in-progress": "heading", completed: "nominal" } as const;
const priorityTones = { low: "neutral", medium: "beacon", high: "alert" } as const;
const progressTones = { planning: "beacon", "in-progress": "heading", completed: "nominal" } as const;

export function ProjectSummary({ project }: ProjectSummaryProps) {
  const statusTone = statusTones[project.status];

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
            Project summary
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-dim">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={statusTone}>{project.status}</Badge>
          <Badge tone={priorityTones[project.priority]}>{project.priority} priority</Badge>
          <Badge>Due {project.deadline}</Badge>
        </div>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink">Overall progress</span>
          <span className="font-display text-ink-dim">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} tone={progressTones[project.status]} />
      </div>
    </Card>
  );
}
