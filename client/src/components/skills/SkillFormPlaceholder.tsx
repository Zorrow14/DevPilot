import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { SectionHeader } from "@/src/components/ui/SectionHeader";

export function SkillFormPlaceholder() {
  return (
    <Card>
      <SectionHeader
        title="Add Skill"
        description="Static form placeholder for a later interactive phase."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Skill name" placeholder="React Foundations" />
        <Input label="Category" placeholder="Frontend" />
      </div>
      <Button className="mt-4">Save Skill</Button>
    </Card>
  );
}
