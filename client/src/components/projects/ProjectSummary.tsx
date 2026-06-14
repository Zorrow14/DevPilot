import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { Project } from "@/src/types";

type ProjectSummaryProps = {
  project: Project;
};

export function ProjectSummary({ project }: ProjectSummaryProps) {
  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Project Summary
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {project.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="indigo">{project.status}</Badge>
          <Badge tone="rose">{project.priority} priority</Badge>
          <Badge>Due {project.deadline}</Badge>
        </div>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            Overall progress
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {project.progress}%
          </span>
        </div>
        <ProgressBar value={project.progress} />
      </div>
    </Card>
  );
}
