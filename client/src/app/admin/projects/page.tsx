"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminProjectTable } from "@/src/components/admin/AdminProjectTable";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminProjectsPage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getAdminProjects(signal));

  return (
    <AdminShell title="Project Monitoring" description="Project health and progress across users.">
      {isLoading ? (
        <Card>Loading projects...</Card>
      ) : error ? (
        <EmptyState title="Projects unavailable" description={error} />
      ) : (
        <AdminProjectTable projects={data ?? []} />
      )}
    </AdminShell>
  );
}
