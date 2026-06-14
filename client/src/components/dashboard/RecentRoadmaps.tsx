import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import type { Roadmap } from "@/src/types";

type RecentRoadmapsProps = {
  roadmap: Roadmap;
};

export function RecentRoadmaps({ roadmap }: RecentRoadmapsProps) {
  return (
    <Card>
      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
        Recent Roadmap
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        {roadmap.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {roadmap.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="indigo">{roadmap.targetRole}</Badge>
        <Badge>{roadmap.duration}</Badge>
      </div>
    </Card>
  );
}
