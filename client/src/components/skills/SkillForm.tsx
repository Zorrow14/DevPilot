"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";

type SkillFormProps = {
  onSaved: () => void;
  onCancel: () => void;
};

/**
 * The first four match the categories the readiness scorer counts for stack
 * coverage, so picking one actually moves the dashboard gauge.
 */
export const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "Deployment",
  "DevOps",
  "Design",
  "AI Tools",
  "Other",
];

export function SkillForm({ onSaved, onCancel }: SkillFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(SKILL_CATEGORIES[0]);
  const [level, setLevel] = useState("beginner");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await api.createSkill({ name, category, level, progress, notes: notes || null });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save skill.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Add a skill
      </h2>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Skill name"
            placeholder="React Foundations"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            label="Category"
            as="select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {SKILL_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Input>
          <Input
            label="Level"
            as="select"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Input>
          <Input
            label="Progress %"
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
          />
        </div>

        <Input
          label="Notes"
          as="textarea"
          rows={3}
          placeholder="What are you practicing right now?"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save skill"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
