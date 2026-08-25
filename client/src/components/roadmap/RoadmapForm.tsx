import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import type { Roadmap, Skill } from "@/src/types";

type RoadmapFormProps = {
  roadmap: Roadmap;
  skills: Skill[];
};

/**
 * Read-only until generation exists server-side: /api/roadmaps is GET-only and
 * returns fixture data, so the fields are disabled rather than left looking live.
 */
export function RoadmapForm({ roadmap, skills }: RoadmapFormProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
          Roadmap builder
        </h2>
        <Badge tone="alert">Not wired up</Badge>
      </div>

      <p className="mt-3 text-sm text-ink-dim">
        Generation is not connected yet — the backend serves a fixture roadmap and has no generate
        endpoint. These fields preview the inputs it will take.
      </p>

      <fieldset className="mt-5 space-y-4" disabled>
        <Input label="Career goal" placeholder="Become internship-ready" />
        <Input label="Current skills" placeholder={skills.map((skill) => skill.name).join(", ")} />
        <Input label="Target role" placeholder={roadmap.targetRole} />
        <Input label="Duration" placeholder={roadmap.duration} />
        <Button className="w-full" disabled>
          Generate roadmap
        </Button>
      </fieldset>
    </Card>
  );
}
