"use client";

import { useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProjectForm } from "@/src/components/projects/ProjectForm";
import { ProjectList } from "@/src/components/projects/ProjectList";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function ProjectsPage() {
  const { data, error, isLoading, reload } = useApiResource((signal) => api.getProjects(signal));
  const [isAdding, setIsAdding] = useState(false);

  return (
    <AppShell
      title="Projects"
      description="Plan portfolio work, deadlines, priorities, and implementation progress."
      action={
        <Button onClick={() => setIsAdding((value) => !value)}>
          {isAdding ? "Close" : "Add Project"}
        </Button>
      }
    >
      {isAdding ? (
        <ProjectForm
          onSaved={() => {
            setIsAdding(false);
            reload();
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : null}

      {isLoading ? (
        <Card>Loading projects...</Card>
      ) : error ? (
        <EmptyState title="Projects unavailable" description={error} />
      ) : (
        <ProjectList projects={data ?? []} onChanged={reload} />
      )}
    </AppShell>
  );
}
