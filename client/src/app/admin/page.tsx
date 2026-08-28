"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminStats } from "@/src/components/admin/AdminStats";
import { FeedbackTable } from "@/src/components/admin/FeedbackTable";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
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
      description="Platform activity across users, projects, skills, and roadmaps."
    >
      {isLoading ? (
        <Card>Loading admin overview...</Card>
      ) : error ? (
        <EmptyState title="Admin overview unavailable" description={error} />
      ) : overview ? (
        <>
          <AdminStats stats={overview.stats} />

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                Task completion
              </h2>
              <p className="mt-3 text-sm text-ink-dim">
                {overview.stats.completedTasks} of {overview.stats.tasks} tasks are done across
                every project.
              </p>
              <div className="mt-5">
                <ProgressBar
                  value={
                    overview.stats.tasks === 0
                      ? 0
                      : Math.round((overview.stats.completedTasks / overview.stats.tasks) * 100)
                  }
                />
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                Recent roadmap activity
              </h2>
              {overview.roadmaps.recent.length === 0 ? (
                <p className="mt-3 text-sm text-ink-dim">No roadmaps generated yet.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {overview.roadmaps.recent.slice(0, 5).map((roadmap) => (
                    <li
                      key={roadmap.id}
                      className="flex items-center justify-between gap-3 border-b border-bezel pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">{roadmap.targetRole}</p>
                        <p className="mt-0.5 text-xs text-ink-faint">
                          {roadmap.ownerName} &middot; {roadmap.createdAt}
                        </p>
                      </div>
                      <Badge tone={roadmap.completedWeeks > 0 ? "nominal" : "neutral"}>
                        {roadmap.completedWeeks} weeks done
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="mt-6">
            <FeedbackTable feedback={overview.feedback} />
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
