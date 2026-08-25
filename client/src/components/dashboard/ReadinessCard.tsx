import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { ReadinessGauge } from "@/src/components/ui/ReadinessGauge";
import { cn } from "@/src/lib/utils";
import type { ReadinessBreakdown } from "@/src/lib/api";

type ReadinessCardProps = {
  readiness: ReadinessBreakdown;
  className?: string;
};

/** Weak areas read red, mid amber, strong green — so the bars diagnose, not just report. */
function toneForScore(score: number) {
  if (score < 34) {
    return "alert" as const;
  }

  if (score < 67) {
    return "beacon" as const;
  }

  return "nominal" as const;
}

export function ReadinessCard({ readiness, className }: ReadinessCardProps) {
  const components = [
    { label: "Skill progress", value: readiness.skills },
    { label: "Projects shipped", value: readiness.projects },
    { label: "Tasks closed", value: readiness.tasks },
    { label: "Stack coverage", value: readiness.coverage },
  ];

  return (
    <Card className={cn("flex h-full flex-col items-center", className)}>
      <ReadinessGauge value={readiness.overall} size={148} />

      <div className="mt-6 w-full space-y-4 border-t border-bezel pt-5">
        {components.map((component) => (
          <div key={component.label}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="font-display text-micro uppercase tracking-wider text-ink-dim">
                {component.label}
              </p>
              <span className="font-display text-sm font-bold text-ink">{component.value}%</span>
            </div>
            <ProgressBar value={component.value} tone={toneForScore(component.value)} />
          </div>
        ))}
      </div>
    </Card>
  );
}
