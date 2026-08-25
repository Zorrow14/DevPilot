import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";
import type { Roadmap, RoadmapStep } from "@/src/types";

type RoadmapTimelineProps = {
  roadmap: Roadmap;
};

const statusTones: Record<RoadmapStep["status"], "neutral" | "heading" | "nominal"> = {
  planned: "neutral",
  active: "heading",
  completed: "nominal",
};

const markerClasses = {
  neutral: "border-bezel-bright bg-console-raised text-ink-dim",
  heading: "border-heading-dim bg-heading-dim/30 text-heading",
  nominal: "border-nominal-dim bg-nominal-dim/30 text-nominal",
};

export function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-micro uppercase tracking-wider text-beacon">
            Mock generated roadmap
          </p>
          <h2 className="mt-2 text-xl font-bold text-ink">{roadmap.title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-dim">{roadmap.description}</p>
        </div>
        <Badge tone="beacon">{roadmap.duration}</Badge>
      </div>
      <div className="mt-6">
        {roadmap.steps.map((step, index) => {
          const tone = statusTones[step.status];
          const isLast = index === roadmap.steps.length - 1;

          return (
            <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span className="absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-px bg-bezel" />
              ) : null}
              <span
                className={cn(
                  "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-bezel border font-display text-[0.625rem] font-bold",
                  markerClasses[tone],
                )}
              >
                WP{String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 rounded-bezel border border-bezel bg-console-raised p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-ink">{step.title}</h3>
                  <Badge tone={tone}>{step.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink-dim">{step.description}</p>
                <p className="mt-2 font-display text-xs font-medium text-ink-dim">
                  {step.duration}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
