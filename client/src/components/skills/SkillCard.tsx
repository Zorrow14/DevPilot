"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { api } from "@/src/lib/api";
import { formatRelativeDate } from "@/src/lib/dates";
import type { Skill } from "@/src/types";

type SkillCardProps = {
  skill: Skill;
  onChanged: () => void;
};

const levelTones = {
  beginner: "beacon",
  intermediate: "heading",
  advanced: "nominal",
} as const;

export function SkillCard({ skill, onChanged }: SkillCardProps) {
  const tone = levelTones[skill.level];
  const practiced = formatRelativeDate(skill.lastPracticed);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsBusy(true);

    try {
      await api.deleteSkill(skill.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete skill.");
      setIsBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="letterpress text-lg font-bold text-ink">{skill.name}</h2>
          <p className="mt-1 text-sm text-ink-dim">
            {practiced ? `Practiced ${practiced}` : "Not practiced yet"}
          </p>
        </div>
        <Badge>{skill.category}</Badge>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Badge tone={tone}>{skill.level}</Badge>
        <span className="font-display text-sm font-semibold text-ink-dim">{skill.progress}%</span>
      </div>
      <div className="mt-4">
        <ProgressBar value={skill.progress} tone={tone} />
      </div>

      {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}

      <div className="mt-4 flex justify-end border-t border-bezel pt-3">
        <Button variant="ghost" onClick={handleDelete} disabled={isBusy}>
          {isBusy ? "Removing..." : "Remove"}
        </Button>
      </div>
    </Card>
  );
}
