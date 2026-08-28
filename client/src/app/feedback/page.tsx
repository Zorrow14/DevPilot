"use client";

import { AppShell } from "@/src/components/layout/AppShell";
import { FeedbackForm } from "@/src/components/feedback/FeedbackForm";
import { FeedbackList } from "@/src/components/feedback/FeedbackList";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function FeedbackPage() {
  const { data, error, isLoading, reload } = useApiResource((signal) => api.getFeedback(signal));

  return (
    <AppShell
      title="Feedback"
      description="Tell us what is working, what is broken, and what is missing."
    >
      {isLoading ? (
        <Card>Loading feedback...</Card>
      ) : error ? (
        <EmptyState title="Feedback unavailable" description={error} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <FeedbackForm onSubmitted={reload} />
          <FeedbackList feedback={data ?? []} onChanged={reload} />
        </div>
      )}
    </AppShell>
  );
}
