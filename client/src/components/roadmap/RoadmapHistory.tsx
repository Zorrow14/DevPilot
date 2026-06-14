import { Card } from "@/src/components/ui/Card";
import type { Roadmap } from "@/src/types";

type RoadmapHistoryProps = {
  roadmaps: Roadmap[];
};

export function RoadmapHistory({ roadmaps }: RoadmapHistoryProps) {
  return (
    <Card className="mt-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Roadmap History
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {roadmaps.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {item.title}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Created {item.createdAt}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
