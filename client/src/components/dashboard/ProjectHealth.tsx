import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { cn } from "@/src/lib/utils";
import type { Project } from "@/src/types";

type ProjectHealthProps = {
  projects: Project[];
  className?: string;
};

function toneForStatus(status: Project["status"]) {
  if (status === "completed") {
    return "nominal" as const;
  }

  return status === "in-progress" ? ("heading" as const) : ("beacon" as const);
}

export function ProjectHealth({ projects, className }: ProjectHealthProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Add a project to start tracking build progress."
        className={className}
      />
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
          Project health
        </h2>
        <span className="font-display text-micro uppercase tracking-wider text-ink-dim">
          {projects.length} tracked
        </span>
      </div>
      <div className="space-y-5">
        {projects.map((project) => (
          <div key={project.id}>
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <p className="font-semibold text-ink">{project.title}</p>
              <span className="font-display text-sm text-ink-dim">{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} tone={toneForStatus(project.status)} />
          </div>
        ))}
      </div>
    </Card>
  );
}
