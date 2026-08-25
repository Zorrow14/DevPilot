import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { Project } from "@/src/types";

type ProjectCardProps = {
  project: Project;
};

const statusTones = { planned: "neutral", "in-progress": "heading", completed: "nominal" } as const;
const priorityTones = { low: "neutral", medium: "beacon", high: "alert" } as const;
const progressTones = { planned: "beacon", "in-progress": "heading", completed: "nominal" } as const;

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="text-xl font-bold text-ink hover:text-beacon"
          >
            {project.title}
          </Link>
          <p className="mt-2 text-sm leading-6 text-ink-dim">{project.description}</p>
        </div>
        <Badge tone={statusTones[project.status]}>{project.status}</Badge>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone={priorityTones[project.priority]}>{project.priority} priority</Badge>
        <Badge>Due {project.deadline}</Badge>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink">Progress</span>
          <span className="font-display text-ink-dim">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} tone={progressTones[project.status]} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>
    </Card>
  );
}
