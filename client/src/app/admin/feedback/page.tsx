"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { FeedbackTable } from "@/src/components/admin/FeedbackTable";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminFeedbackPage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getAdminFeedback(signal));

  return (
    <AdminShell title="Feedback" description="Feedback queue submitted by users.">
      {isLoading ? (
        <Card>Loading feedback...</Card>
      ) : error ? (
        <EmptyState title="Feedback unavailable" description={error} />
      ) : (
        <FeedbackTable feedback={data ?? []} />
      )}
    </AdminShell>
  );
}
