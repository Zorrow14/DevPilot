import { AppShell } from "@/src/components/layout/AppShell";
import { RoadmapForm } from "@/src/components/roadmap/RoadmapForm";
import { RoadmapHistory } from "@/src/components/roadmap/RoadmapHistory";
import { RoadmapTimeline } from "@/src/components/roadmap/RoadmapTimeline";
import { mockRoadmaps, mockSkills } from "@/src/data/mockData";

export default function RoadmapPage() {
  const roadmap = mockRoadmaps[0];

  return (
    <AppShell
      title="Roadmap"
      description="Generate a static mock learning roadmap before real AI is connected."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <RoadmapForm roadmap={roadmap} skills={mockSkills} />
        <RoadmapTimeline roadmap={roadmap} />
      </div>

      <RoadmapHistory roadmaps={mockRoadmaps} />
    </AppShell>
  );
}
