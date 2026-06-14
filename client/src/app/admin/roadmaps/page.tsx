import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminAnalyticsCard } from "@/src/components/admin/AdminAnalyticsCard";
import { mockRoadmaps } from "@/src/data/mockData";

export default function AdminRoadmapsPage() {
  return (
    <AdminShell title="Roadmap Monitoring" description="Static roadmap generation activity placeholders.">
      <div className="grid gap-5 lg:grid-cols-2">
        {mockRoadmaps.map((roadmap) => (
          <AdminAnalyticsCard
            key={roadmap.id}
            title={roadmap.title}
            subtitle={`${roadmap.targetRole} • created ${roadmap.createdAt}`}
            value={roadmap.steps.length * 25}
            badge={`${roadmap.steps.length} steps`}
          />
        ))}
      </div>
    </AdminShell>
  );
}
