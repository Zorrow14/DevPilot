import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import type { Roadmap } from "@/src/types";

type RecentRoadmapsProps = {
  roadmap: Roadmap;
};

export function RecentRoadmaps({ roadmap }: RecentRoadmapsProps) {
  return (
    <Card>
      <p className="font-display text-[0.6875rem] uppercase tracking-wider text-heading">
        Recent roadmap
      </p>
      <h2 className="mt-2 text-lg font-bold text-ink">{roadmap.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-dim">{roadmap.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="heading">{roadmap.targetRole}</Badge>
        <Badge>{roadmap.duration}</Badge>
      </div>
    </Card>
  );
}
