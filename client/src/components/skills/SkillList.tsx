import { EmptyState } from "@/src/components/ui/EmptyState";
import type { Skill } from "@/src/types";
import { SkillCard } from "./SkillCard";

type SkillListProps = {
  skills: Skill[];
  onChanged: () => void;
  emptyDescription?: string;
};

export function SkillList({ skills, onChanged, emptyDescription }: SkillListProps) {
  if (skills.length === 0) {
    return (
      <EmptyState
        title="No skills yet"
        description={emptyDescription ?? "Use Add Skill to start tracking what you're learning."}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} onChanged={onChanged} />
      ))}
    </div>
  );
}
