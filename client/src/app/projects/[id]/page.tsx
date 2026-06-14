"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProjectSummary } from "@/src/components/projects/ProjectSummary";
import { TaskList } from "@/src/components/projects/TaskList";
import { api } from "@/src/lib/api";
import type { Project, Task } from "@/src/types";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjectDetails() {
      try {
        const [projectData, taskData] = await Promise.all([
          api.getProject(params.id),
          api.getProjectTasks(params.id),
        ]);

        setProject(projectData);
        setTasks(taskData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load project details.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProjectDetails();
  }, [params.id]);

  return (
    <AppShell
      title={project?.title ?? "Project Details"}
      description="Static project details view using backend mock data."
      action={<Button href="#">Add Task</Button>}
    >
      {isLoading ? (
        <Card>Loading project details...</Card>
      ) : error ? (
        <EmptyState title="Project unavailable" description={error} />
      ) : project ? (
        <>
          <ProjectSummary project={project} />
          <TaskList tasks={tasks} />
        </>
      ) : null}
    </AppShell>
  );
}
