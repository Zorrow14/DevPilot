import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { Skill } from "@/src/types";

type SkillCardProps = {
  skill: Skill;
};

const levelTones = {
  beginner: "beacon",
  intermediate: "heading",
  advanced: "nominal",
} as const;

export function SkillCard({ skill }: SkillCardProps) {
  const tone = levelTones[skill.level];

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">{skill.name}</h2>
          <p className="mt-1 text-sm text-ink-dim">Practiced {skill.lastPracticed}</p>
        </div>
        <Badge>{skill.category}</Badge>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Badge tone={tone}>{skill.level}</Badge>
        <span className="font-display text-sm font-semibold text-ink-dim">
          {skill.progress}%
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={skill.progress} tone={tone} />
      </div>
    </Card>
  );
}
