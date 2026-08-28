"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { api } from "@/src/lib/api";
import { formatRelativeDate } from "@/src/lib/dates";
import { cn } from "@/src/lib/utils";
import type { Roadmap } from "@/src/types";

type RoadmapHistoryProps = {
  roadmaps: Roadmap[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChanged: () => void;
};

export function RoadmapHistory({
  roadmaps,
  selectedId,
  onSelect,
  onChanged,
}: RoadmapHistoryProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setError(null);
    setPendingId(id);

    try {
      await api.deleteRoadmap(id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete roadmap.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card className="mt-6">
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Roadmap history
      </h2>

      {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {roadmaps.map((item) => {
          const isSelected = item.id === selectedId;
          const done = item.completedWeeks.length;
          const total = item.steps.length;
          const created = formatRelativeDate(item.createdAt);

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-bezel border bg-console-raised p-4",
                isSelected ? "border-beacon-dim" : "border-bezel",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="text-left font-semibold text-ink hover:text-beacon"
                >
                  {item.title}
                </button>
                {isSelected ? <Badge tone="beacon">Viewing</Badge> : null}
              </div>

              <p className="mt-1 text-sm text-ink-dim">
                {item.targetRole} &middot; {created ? `created ${created}` : item.createdAt}
              </p>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-bezel pt-3">
                <span className="font-display text-micro uppercase tracking-wider text-ink-faint">
                  {total > 0 ? `${done} / ${total} weeks done` : "Plan unavailable"}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  disabled={pendingId === item.id}
                >
                  {pendingId === item.id ? "Removing..." : "Remove"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
