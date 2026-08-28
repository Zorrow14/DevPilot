"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { UserTable } from "@/src/components/admin/UserTable";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Input } from "@/src/components/ui/Input";
import { useApiResource } from "@/src/hooks/useApiResource";
import { useAuth } from "@/src/hooks/useAuth";
import { api } from "@/src/lib/api";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const { profile } = useAuth();

  // Debounced so typing does not fire a request per keystroke. The committed
  // value is what keys the fetch, so useApiResource refetches only when it moves.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, error, isLoading, reload } = useApiResource(
    (signal) => api.getAdminUsers(query, signal),
    query,
  );

  return (
    <AdminShell title="Users" description="Registered users, their role, and account status.">
      <Card className="mb-6">
        <Input
          label="Search users"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </Card>

      {isLoading ? (
        <Card>Loading users...</Card>
      ) : error ? (
        <EmptyState title="Users unavailable" description={error} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No users found"
          description={query ? `Nothing matches "${query}".` : "No accounts have been created yet."}
        />
      ) : (
        <UserTable users={data ?? []} currentUserId={profile?.id} onChanged={reload} />
      )}
    </AdminShell>
  );
}
