"use client";

import { useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { RoadmapForm } from "@/src/components/roadmap/RoadmapForm";
import { RoadmapHistory } from "@/src/components/roadmap/RoadmapHistory";
import { RoadmapTimeline } from "@/src/components/roadmap/RoadmapTimeline";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function RoadmapPage() {
  const { data, error, isLoading, reload } = useApiResource((signal) =>
    Promise.all([api.getRoadmaps(signal), api.getSkills(signal), api.getMe(signal)]),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const roadmaps = data?.[0] ?? [];
  const skills = data?.[1] ?? [];
  const profile = data?.[2];

  // Falls back to the newest roadmap, so a fresh generation is what you see
  // without the selection having to be cleared explicitly.
  const roadmap = roadmaps.find((item) => item.id === selectedId) ?? roadmaps[0];

  function handleGenerated() {
    setSelectedId(null);
    reload();
  }

  return (
    <AppShell
      title="Roadmap"
      description="Generate a week-by-week learning plan from your goal and tracked skills."
    >
      {isLoading ? (
        <Card>Loading roadmap data...</Card>
      ) : error ? (
        <EmptyState title="Roadmap unavailable" description={error} />
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <RoadmapForm
              skills={skills}
              targetRole={profile?.targetRole ?? ""}
              onGenerated={handleGenerated}
            />
            {roadmap ? (
              <RoadmapTimeline roadmap={roadmap} onChanged={reload} />
            ) : (
              <EmptyState
                title="No roadmaps yet"
                description="Generate your first plan to see a week-by-week timeline here."
              />
            )}
          </div>

          {roadmaps.length > 0 ? (
            <RoadmapHistory
              roadmaps={roadmaps}
              selectedId={roadmap?.id ?? null}
              onSelect={setSelectedId}
              onChanged={reload}
            />
          ) : null}
        </>
      )}
    </AppShell>
  );
}
