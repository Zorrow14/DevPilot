import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { Sparkle } from "@/src/components/ui/Sparkle";
import { cn } from "@/src/lib/utils";
import type { Roadmap } from "@/src/types";

type RecentRoadmapsProps = {
  roadmap: Roadmap;
  className?: string;
};

export function RecentRoadmaps({ roadmap, className }: RecentRoadmapsProps) {
  return (
    <Card className={cn("h-full", className)}>
      <p className="flex items-center gap-1.5 font-display text-micro uppercase tracking-wider text-ai">
        <Sparkle /> Recent roadmap
      </p>
      <h2 className="letterpress mt-2 text-lg font-bold text-ink">{roadmap.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-dim">{roadmap.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="heading">{roadmap.targetRole}</Badge>
        <Badge>{roadmap.duration}</Badge>
      </div>
    </Card>
  );
}
