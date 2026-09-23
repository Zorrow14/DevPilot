"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { UserTable } from "@/src/components/admin/UserTable";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Input } from "@/src/components/ui/Input";
import { Pagination } from "@/src/components/ui/Pagination";
import { useApiResource } from "@/src/hooks/useApiResource";
import { useAuth } from "@/src/hooks/useAuth";
import { api } from "@/src/lib/api";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { profile } = useAuth();

  // Debounced so typing does not fire a request per keystroke. The committed
  // value is what keys the fetch, so useApiResource refetches only when it moves.
  //
  // Committing a search also re-pages from the start: searching while on page 3
  // would otherwise ask for page 3 of a shorter result set and land on an empty
  // table. Both happen in the timer callback so it stays one action.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, error, isLoading, reload } = useApiResource(
    (signal) => api.getAdminUsers(query, { page }, signal),
    `${query}|${page}`,
  );

  const users = data?.data ?? [];

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
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description={query ? `Nothing matches "${query}".` : "No accounts have been created yet."}
        />
      ) : (
        <>
          <UserTable users={users} currentUserId={profile?.id} onChanged={reload} />
          {data ? (
            <Pagination {...data.pagination} onPageChange={setPage} label="users" />
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
