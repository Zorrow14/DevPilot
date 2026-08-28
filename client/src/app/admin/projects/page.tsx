"use client";

import { useState } from "react";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminProjectTable } from "@/src/components/admin/AdminProjectTable";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Input } from "@/src/components/ui/Input";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

const STATUSES = ["planning", "in-progress", "completed"];
const PRIORITIES = ["low", "medium", "high"];

export default function AdminProjectsPage() {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const { data, error, isLoading, reload } = useApiResource(
    (signal) => api.getAdminProjects({ status, priority }, signal),
    `${status}|${priority}`,
  );

  return (
    <AdminShell title="Project Monitoring" description="Project health and progress across users.">
      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Status"
            as="select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Input>
          <Input
            label="Priority"
            as="select"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Input>
        </div>
      </Card>

      {isLoading ? (
        <Card>Loading projects...</Card>
      ) : error ? (
        <EmptyState title="Projects unavailable" description={error} />
      ) : (
        <AdminProjectTable projects={data ?? []} onChanged={reload} />
      )}
    </AdminShell>
  );
}
