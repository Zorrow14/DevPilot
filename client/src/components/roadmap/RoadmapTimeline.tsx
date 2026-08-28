"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { Sparkle } from "@/src/components/ui/Sparkle";
import { Toggle } from "@/src/components/ui/Toggle";
import { api } from "@/src/lib/api";
import { cn } from "@/src/lib/utils";
import type { Roadmap, RoadmapStep } from "@/src/types";

type RoadmapTimelineProps = {
  roadmap: Roadmap;
  onChanged: () => void;
};

const statusTones: Record<RoadmapStep["status"], "neutral" | "heading" | "nominal"> = {
  planned: "neutral",
  active: "heading",
  completed: "nominal",
};

const markerClasses = {
  neutral: "border-bezel-bright bg-console-raised text-ink-dim",
  heading: "border-heading-dim bg-heading-dim/30 text-heading",
  nominal: "border-nominal-dim bg-nominal-dim/30 text-nominal",
};

export function RoadmapTimeline({ roadmap, onChanged }: RoadmapTimelineProps) {
  const [error, setError] = useState<string | null>(null);
  // Tracks the specific week in flight, so only that toggle disables rather
  // than the whole plan freezing on every tick.
  const [pendingWeek, setPendingWeek] = useState<number | null>(null);

  async function handleToggle(week: number, completed: boolean) {
    setError(null);
    setPendingWeek(week);

    try {
      await api.setRoadmapWeek(roadmap.id, week, completed);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update progress.");
    } finally {
      setPendingWeek(null);
    }
  }

  const completed = roadmap.steps.filter((step) => step.status === "completed").length;

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 font-display text-micro uppercase tracking-wider text-ai">
            <Sparkle /> AI generated roadmap
          </p>
          <h2 className="letterpress mt-2 text-xl font-bold text-ink">{roadmap.title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-dim">{roadmap.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Badge tone="beacon">{roadmap.duration}</Badge>
          {roadmap.steps.length > 0 ? (
            <span className="font-display text-micro uppercase tracking-wider text-ink-faint">
              {completed} / {roadmap.steps.length} weeks done
            </span>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-alert">{error}</p> : null}

      <div className="mt-6">
        {roadmap.steps.map((step, index) => {
          const tone = statusTones[step.status];
          const isLast = index === roadmap.steps.length - 1;

          return (
            <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span className="absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-px bg-bezel" />
              ) : null}
              <span
                className={cn(
                  "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-bezel border font-display text-[0.625rem] font-bold",
                  markerClasses[tone],
                )}
              >
                WP{String(step.week).padStart(2, "0")}
              </span>
              <div className="flex-1 rounded-bezel border border-bezel bg-console-raised p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-ink">{step.title}</h3>
                  <Badge tone={tone}>{step.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink-dim">{step.description}</p>
                <div className="mt-3 border-t border-bezel pt-3">
                  <Toggle
                    checked={step.status === "completed"}
                    onChange={(next) => handleToggle(step.week, next)}
                    disabled={pendingWeek === step.week}
                    label="Mark week complete"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {roadmap.content ? <RoadmapDetails content={roadmap.content} /> : null}
    </Card>
  );
}

/**
 * The sections that are not a sequence — recommended skills, mini projects,
 * milestones, pitfalls, next steps. Kept out of the timeline so the waypoint
 * column stays a single readable spine.
 */
function RoadmapDetails({ content }: { content: NonNullable<Roadmap["content"]> }) {
  return (
    <div className="mt-2 grid gap-4 border-t border-bezel pt-6 md:grid-cols-2">
      <DetailPanel title="Recommended skills">
        <ul className="space-y-2">
          {content.recommendedSkills.map((skill) => (
            <li key={skill.name} className="text-sm leading-6 text-ink-dim">
              <span className="font-semibold text-ink">{skill.name}</span> — {skill.reason}
            </li>
          ))}
        </ul>
      </DetailPanel>

      <DetailPanel title="Mini projects">
        <ul className="space-y-2">
          {content.miniProjects.map((project) => (
            <li key={project.title} className="text-sm leading-6 text-ink-dim">
              <span className="font-semibold text-ink">{project.title}</span> —{" "}
              {project.description}
            </li>
          ))}
        </ul>
      </DetailPanel>

      <DetailPanel title="Milestones">
        <ul className="space-y-2">
          {content.milestones.map((milestone) => (
            <li
              key={`${milestone.week}-${milestone.title}`}
              className="flex gap-2 text-sm leading-6 text-ink-dim"
            >
              <span className="font-display text-micro font-bold uppercase tracking-wider text-beacon">
                W{milestone.week}
              </span>
              {milestone.title}
            </li>
          ))}
        </ul>
      </DetailPanel>

      <DetailPanel title="Mistakes to avoid">
        <BulletList items={content.mistakesToAvoid} />
      </DetailPanel>

      <DetailPanel title="Next steps" className="md:col-span-2">
        <BulletList items={content.nextSteps} />
      </DetailPanel>
    </div>
  );
}

function DetailPanel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-bezel border border-bezel bg-console-raised p-4", className)}>
      <h3 className="font-display text-micro font-bold uppercase tracking-wider text-ink-faint">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-ink-dim">
          <span aria-hidden className="text-ink-faint">
            &bull;
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
