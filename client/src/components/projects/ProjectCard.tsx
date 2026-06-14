import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { Project } from "@/src/types";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="text-xl font-bold text-slate-900 hover:text-indigo-700 dark:text-slate-100 dark:hover:text-indigo-300"
          >
            {project.title}
          </Link>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {project.description}
          </p>
        </div>
        <Badge tone={project.status === "completed" ? "green" : "indigo"}>
          {project.status}
        </Badge>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge tone={project.priority === "high" ? "rose" : "amber"}>
          {project.priority} priority
        </Badge>
        <Badge>Due {project.deadline}</Badge>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            Progress
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {project.progress}%
          </span>
        </div>
        <ProgressBar value={project.progress} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>
    </Card>
  );
}
