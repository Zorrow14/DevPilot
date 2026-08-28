"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { StatCard } from "@/src/components/ui/StatCard";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminSkillsPage() {
  const { data, error, isLoading } = useApiResource((signal) =>
    api.getAdminSkillAnalytics(signal),
  );

  return (
    <AdminShell title="Skill Analytics" description="Skill distribution and progress across users.">
      {isLoading ? (
        <Card>Loading skill analytics...</Card>
      ) : error ? (
        <EmptyState title="Skill analytics unavailable" description={error} />
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Skills tracked" value={data.totalSkills} tone="beacon" />
            <StatCard label="Average progress" value={`${data.averageProgress}%`} tone="nominal" />
            <StatCard
              label="Categories in use"
              value={data.byCategory.length}
              helper={data.byCategory[0]?.category ?? "None yet"}
              tone="heading"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                Most added skills
              </h2>
              {data.mostAdded.length === 0 ? (
                <p className="mt-3 text-sm text-ink-dim">No skills tracked yet.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {data.mostAdded.map((row) => (
                    <li key={row.name}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-ink">{row.name}</span>
                        <Badge tone="beacon">
                          {row.count} {row.count === 1 ? "user" : "users"}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={row.averageProgress} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="space-y-6">
              <Card>
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                  Level distribution
                </h2>
                {data.byLevel.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-dim">No skills tracked yet.</p>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {data.byLevel.map((row) => (
                      <li key={row.level} className="flex items-center justify-between gap-3">
                        <span className="text-sm capitalize text-ink-dim">{row.level}</span>
                        <Badge>{row.count}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card>
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                  Common categories
                </h2>
                {data.byCategory.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-dim">No skills tracked yet.</p>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {data.byCategory.map((row) => (
                      <li key={row.category} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-ink-dim">{row.category}</span>
                        <span className="font-display text-xs text-ink-faint">
                          {row.count} &middot; avg {row.averageProgress}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}
