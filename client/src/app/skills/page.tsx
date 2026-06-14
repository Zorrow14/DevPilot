import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { SkillFilters } from "@/src/components/skills/SkillFilters";
import { SkillList } from "@/src/components/skills/SkillList";
import { mockSkills } from "@/src/data/mockData";

export default function SkillsPage() {
  return (
    <AppShell
      title="Skills"
      description="Track your learning areas, confidence level, and recent practice rhythm."
      action={<Button href="#">Add Skill</Button>}
    >
      <SkillFilters />
      <SkillList skills={mockSkills} />
    </AppShell>
  );
}
