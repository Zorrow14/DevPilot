import { EmptyState } from "@/src/components/ui/EmptyState";
import type { Skill } from "@/src/types";
import { SkillCard } from "./SkillCard";

type SkillListProps = {
  skills: Skill[];
};

export function SkillList({ skills }: SkillListProps) {
  if (skills.length === 0) {
    return (
      <EmptyState
        title="No skills yet"
        description="Add your first skill when the form becomes active."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
