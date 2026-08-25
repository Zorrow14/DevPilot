"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminAnalyticsCard } from "@/src/components/admin/AdminAnalyticsCard";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminSkillsPage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getAdminSkills(signal));

  return (
    <AdminShell title="Skill Analytics" description="Skill distribution and progress across users.">
      {isLoading ? (
        <Card>Loading skill analytics...</Card>
      ) : error ? (
        <EmptyState title="Skill analytics unavailable" description={error} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((skill) => (
            <AdminAnalyticsCard
              key={skill.id}
              title={skill.name}
              subtitle={skill.category}
              value={skill.progress}
              badge={skill.level}
            />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
