"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProjectList } from "@/src/components/projects/ProjectList";
import { api } from "@/src/lib/api";
import type { Project } from "@/src/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        setProjects(await api.getProjects());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load projects.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProjects();
  }, []);

  return (
    <AppShell
      title="Projects"
      description="Plan portfolio work, deadlines, priorities, and implementation progress."
      action={<Button href="#">Add Project</Button>}
    >
      {isLoading ? (
        <Card>Loading projects...</Card>
      ) : error ? (
        <EmptyState title="Projects unavailable" description={error} />
      ) : (
        <ProjectList projects={projects} />
      )}
    </AppShell>
  );
}
