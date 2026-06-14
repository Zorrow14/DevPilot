import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import type { Roadmap } from "@/src/types";

type RoadmapTimelineProps = {
  roadmap: Roadmap;
};

export function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            Mock Generated Roadmap
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
            {roadmap.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {roadmap.description}
          </p>
        </div>
        <Badge tone="indigo">{roadmap.duration}</Badge>
      </div>
      <div className="mt-6 space-y-4">
        {roadmap.steps.map((step, index) => (
          <div
            key={step.id}
            className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {index + 1}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <Badge tone={step.status === "active" ? "indigo" : "slate"}>
                    {step.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  {step.duration}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
