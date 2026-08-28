"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { StatCard } from "@/src/components/ui/StatCard";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminRoadmapsPage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getAdminRoadmaps(signal));

  return (
    <AdminShell title="Roadmap Monitoring" description="AI roadmap generation activity.">
      {isLoading ? (
        <Card>Loading roadmaps...</Card>
      ) : error ? (
        <EmptyState title="Roadmaps unavailable" description={error} />
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard label="Roadmaps generated" value={data.totalGenerated} tone="beacon" />
            <StatCard
              label="Distinct target roles"
              value={data.commonTargetRoles.length}
              helper={data.commonTargetRoles[0]?.targetRole ?? "None yet"}
              tone="heading"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                Most common target roles
              </h2>
              {data.commonTargetRoles.length === 0 ? (
                <p className="mt-4 text-sm text-ink-dim">No roadmaps generated yet.</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {data.commonTargetRoles.map((row) => (
                    <li
                      key={row.targetRole}
                      className="flex items-center justify-between gap-3 border-b border-bezel pb-3 last:border-0 last:pb-0"
                    >
                      <span className="text-sm text-ink-dim">{row.targetRole}</span>
                      <Badge tone="beacon">{row.count}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                Recent generations
              </h2>
              {data.recent.length === 0 ? (
                <p className="mt-4 text-sm text-ink-dim">Nothing generated yet.</p>
              ) : (
                <div className="mt-5 space-y-4">
                  {data.recent.map((roadmap) => (
                    <div
                      key={roadmap.id}
                      className="rounded-bezel border border-bezel bg-console-raised p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink">{roadmap.goal}</p>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            {roadmap.ownerName} &middot; {roadmap.targetRole} &middot;{" "}
                            {roadmap.createdAt}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge>{roadmap.duration}</Badge>
                          {/* Weeks the user actually ticked off, not a count of
                              however many steps the generator produced. */}
                          <Badge tone={roadmap.completedWeeks > 0 ? "nominal" : "neutral"}>
                            {roadmap.completedWeeks} done
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
