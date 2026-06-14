import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";

export function SkillFilters() {
  return (
    <Card className="mb-6">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <Input placeholder="Search skills" />
        <Input as="select">
          <option>All categories</option>
          <option>Frontend</option>
          <option>Backend</option>
          <option>Database</option>
          <option>Design</option>
        </Input>
      </div>
    </Card>
  );
}
