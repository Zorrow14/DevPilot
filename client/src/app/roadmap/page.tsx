"use client";

import { AppShell } from "@/src/components/layout/AppShell";
import { RoadmapForm } from "@/src/components/roadmap/RoadmapForm";
import { RoadmapHistory } from "@/src/components/roadmap/RoadmapHistory";
import { RoadmapTimeline } from "@/src/components/roadmap/RoadmapTimeline";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function RoadmapPage() {
  const { data, error, isLoading } = useApiResource((signal) =>
    Promise.all([api.getRoadmaps(signal), api.getSkills(signal)]),
  );

  const roadmaps = data?.[0] ?? [];
  const skills = data?.[1] ?? [];
  const roadmap = roadmaps[0];

  return (
    <AppShell
      title="Roadmap"
      description="Generate a static mock learning roadmap before real AI is connected."
    >
      {isLoading ? (
        <Card>Loading roadmap data...</Card>
      ) : error ? (
        <EmptyState title="Roadmap unavailable" description={error} />
      ) : roadmap ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <RoadmapForm roadmap={roadmap} skills={skills} />
            <RoadmapTimeline roadmap={roadmap} />
          </div>

          <RoadmapHistory roadmaps={roadmaps} />
        </>
      ) : (
        <EmptyState
          title="No roadmaps yet"
          description="Mock roadmaps will appear here when the backend returns data."
        />
      )}
    </AppShell>
  );
}
