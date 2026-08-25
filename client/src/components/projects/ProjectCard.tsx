"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { api } from "@/src/lib/api";
import type { Project } from "@/src/types";

type ProjectCardProps = {
  project: Project;
  onChanged: () => void;
};

const statusTones = { planning: "neutral", "in-progress": "heading", completed: "nominal" } as const;
const priorityTones = { low: "neutral", medium: "beacon", high: "alert" } as const;
const progressTones = { planning: "beacon", "in-progress": "heading", completed: "nominal" } as const;

export function ProjectCard({ project, onChanged }: ProjectCardProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsBusy(true);

    try {
      await api.deleteProject(project.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete project.");
      setIsBusy(false);
    }
  }

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

      {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}

      <div className="mt-5 flex justify-end gap-1 border-t border-bezel pt-3">
        <Button variant="ghost" href={`/projects/${project.id}`}>
          Open
        </Button>
        <Button variant="ghost" onClick={handleDelete} disabled={isBusy}>
          {isBusy ? "Removing..." : "Remove"}
        </Button>
      </div>
    </Card>
  );
}
