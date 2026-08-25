"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { UserTable } from "@/src/components/admin/UserTable";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminUsersPage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getAdminUsers(signal));

  return (
    <AdminShell title="Users" description="Registered users and their platform status.">
      {isLoading ? (
        <Card>Loading users...</Card>
      ) : error ? (
        <EmptyState title="Users unavailable" description={error} />
      ) : (
        <UserTable users={data ?? []} />
      )}
    </AdminShell>
  );
}
