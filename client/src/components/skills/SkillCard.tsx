import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { Skill } from "@/src/types";

type SkillCardProps = {
  skill: Skill;
};

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {skill.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Practiced {skill.lastPracticed}
          </p>
        </div>
        <Badge tone="indigo">{skill.category}</Badge>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <Badge tone={skill.level === "advanced" ? "green" : "amber"}>
          {skill.level}
        </Badge>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {skill.progress}%
        </span>
      </div>
      <div className="mt-4">
        <ProgressBar value={skill.progress} />
      </div>
    </Card>
  );
}
