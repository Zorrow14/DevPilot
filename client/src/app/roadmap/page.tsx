"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { RoadmapForm } from "@/src/components/roadmap/RoadmapForm";
import { RoadmapHistory } from "@/src/components/roadmap/RoadmapHistory";
import { RoadmapTimeline } from "@/src/components/roadmap/RoadmapTimeline";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { api } from "@/src/lib/api";
import type { Roadmap, Skill } from "@/src/types";

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRoadmapData() {
      try {
        const [roadmapData, skillData] = await Promise.all([
          api.getRoadmaps(),
          api.getSkills(),
        ]);

        setRoadmaps(roadmapData);
        setSkills(skillData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load roadmap data.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadRoadmapData();
  }, []);

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
