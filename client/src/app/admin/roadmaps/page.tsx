"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminAnalyticsCard } from "@/src/components/admin/AdminAnalyticsCard";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminRoadmapsPage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getAdminRoadmaps(signal));

  return (
    <AdminShell title="Roadmap Monitoring" description="Roadmap generation activity across users.">
      {isLoading ? (
        <Card>Loading roadmaps...</Card>
      ) : error ? (
        <EmptyState title="Roadmaps unavailable" description={error} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {(data ?? []).map((roadmap) => (
            <AdminAnalyticsCard
              key={roadmap.id}
              title={roadmap.title}
              subtitle={`${roadmap.targetRole} • created ${roadmap.createdAt}`}
              value={roadmap.steps.length * 25}
              badge={`${roadmap.steps.length} steps`}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
