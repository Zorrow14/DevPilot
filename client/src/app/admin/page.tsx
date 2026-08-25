"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminStats } from "@/src/components/admin/AdminStats";
import { AdminAnalyticsCard } from "@/src/components/admin/AdminAnalyticsCard";
import { FeedbackTable } from "@/src/components/admin/FeedbackTable";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminPage() {
  const {
    data: overview,
    error,
    isLoading,
  } = useApiResource((signal) => api.getAdminOverview(signal));

  return (
    <AdminShell
      title="Admin Overview"
      description="Static platform monitoring dashboard using backend mock data."
    >
      {isLoading ? (
        <Card>Loading admin overview...</Card>
      ) : error ? (
        <EmptyState title="Admin overview unavailable" description={error} />
      ) : overview ? (
        <>
          <AdminStats
            users={overview.users}
            projects={overview.projects}
            skills={overview.skills}
            feedback={overview.feedback}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {overview.roadmaps.map((roadmap) => (
              <AdminAnalyticsCard
                key={roadmap.id}
                title={roadmap.title}
                subtitle={roadmap.targetRole}
                value={roadmap.steps.length * 25}
                badge={roadmap.duration}
              />
            ))}
            <AdminAnalyticsCard
              title="Skill coverage"
              subtitle="Mock distribution across tracked categories"
              value={82}
              badge={`${overview.skills.length} skills`}
            />
          </div>
          <div className="mt-6">
            <FeedbackTable feedback={overview.feedback} />
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
