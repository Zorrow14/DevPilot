import { Card } from "@/src/components/ui/Card";
import type { Roadmap } from "@/src/types";

type RoadmapHistoryProps = {
  roadmaps: Roadmap[];
};

export function RoadmapHistory({ roadmaps }: RoadmapHistoryProps) {
  return (
    <Card className="mt-6">
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Roadmap history
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {roadmaps.map((item) => (
          <div key={item.id} className="rounded-bezel border border-bezel bg-console-raised p-4">
            <p className="font-semibold text-ink">{item.title}</p>
            <p className="mt-1 text-sm text-ink-dim">Created {item.createdAt}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
