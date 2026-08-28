"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Sparkle } from "@/src/components/ui/Sparkle";
import { api } from "@/src/lib/api";
import type { Skill } from "@/src/types";

type RoadmapFormProps = {
  skills: Skill[];
  targetRole: string;
  onGenerated: () => void;
};

/**
 * Durations are a fixed list rather than free text: the generator caps the plan
 * at 16 weeks, and an open field invites "2 years", which produces a truncated
 * plan that silently ignores what was asked for.
 */
const DURATIONS = ["4 weeks", "6 weeks", "8 weeks", "12 weeks", "16 weeks"];

export function RoadmapForm({ skills, targetRole, onGenerated }: RoadmapFormProps) {
  const [goal, setGoal] = useState("");
  const [role, setRole] = useState(targetRole);
  const [duration, setDuration] = useState(DURATIONS[2]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      await api.generateRoadmap({
        goal,
        targetRole: role,
        duration,
        // Sent from the tracked skill list rather than a free-text field, so the
        // model builds on what the user actually has instead of what they
        // remembered to type.
        currentSkills: skills.map((skill) => skill.name),
      });
      setGoal("");
      onGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate a roadmap.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <h2 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-ink">
        <Sparkle /> Roadmap builder
      </h2>

      <p className="mt-3 text-sm text-ink-dim">
        Generates a week-by-week plan from your goal and the skills already on your profile.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
            {error}
          </p>
        ) : null}

        <Input
          label="Career goal"
          placeholder="Become internship-ready as a frontend developer"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          required
        />
        <Input
          label="Target role"
          placeholder="Frontend Developer Intern"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          required
        />
        <Input
          label="Duration"
          as="select"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
        >
          {DURATIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Input>

        <div className="rounded-bezel border border-bezel bg-console-raised px-4 py-3">
          <p className="font-display text-micro uppercase tracking-wider text-ink-faint">
            Skills sent as context
          </p>
          <p className="mt-1.5 text-sm text-ink-dim">
            {skills.length > 0
              ? skills.map((skill) => skill.name).join(", ")
              : "None yet — add skills to get a plan that builds on what you know."}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate roadmap"}
        </Button>
      </form>
    </Card>
  );
}
