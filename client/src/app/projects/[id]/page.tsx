"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProjectSummary } from "@/src/components/projects/ProjectSummary";
import { TaskForm } from "@/src/components/projects/TaskForm";
import { TaskList } from "@/src/components/projects/TaskList";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const [isAdding, setIsAdding] = useState(false);

  const { data, error, isLoading, reload } = useApiResource(
    (signal) =>
      Promise.all([api.getProject(params.id, signal), api.getProjectTasks(params.id, signal)]),
    params.id,
  );

  const project = data?.[0] ?? null;
  const tasks = data?.[1] ?? [];

  return (
    <AppShell
      title={project?.title ?? "Project Details"}
      description="Project details, tasks, and progress for this build."
      action={
        project ? (
          <Button onClick={() => setIsAdding((value) => !value)}>
            {isAdding ? "Close" : "Add Task"}
          </Button>
        ) : undefined
      }
    >
      {isLoading ? (
        <Card>Loading project details...</Card>
      ) : error ? (
        <EmptyState title="Project unavailable" description={error} />
      ) : project ? (
        <>
          <ProjectSummary project={project} />

          {isAdding ? (
            <TaskForm
              projectId={project.id}
              onSaved={() => {
                setIsAdding(false);
                reload();
              }}
              onCancel={() => setIsAdding(false)}
            />
          ) : null}

          <TaskList tasks={tasks} onChanged={reload} />
        </>
      ) : null}
    </AppShell>
  );
}
