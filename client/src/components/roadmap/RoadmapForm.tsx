import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import type { Roadmap, Skill } from "@/src/types";

type RoadmapFormProps = {
  roadmap: Roadmap;
  skills: Skill[];
};

export function RoadmapForm({ roadmap, skills }: RoadmapFormProps) {
  return (
    <Card>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Roadmap Builder
      </h2>
      <form className="mt-5 space-y-4">
        <Input label="Career goal" placeholder="Become internship-ready" />
        <Input
          label="Current skills"
          placeholder={skills.map((skill) => skill.name).join(", ")}
        />
        <Input label="Target role" placeholder={roadmap.targetRole} />
        <Input label="Duration" placeholder={roadmap.duration} />
        <Button className="w-full">Generate Roadmap</Button>
      </form>
    </Card>
  );
}
