"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";

type ProjectFormProps = {
  onSaved: () => void;
  onCancel: () => void;
};

export function ProjectForm({ onSaved, onCancel }: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [status, setStatus] = useState("planning");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await api.createProject({
        title,
        description: description || null,
        techStack: techStack
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
        status,
        priority,
        deadline: deadline || null,
        progress,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save project.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Add a project
      </h2>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
            {error}
          </p>
        ) : null}

        <Input
          label="Title"
          placeholder="Developer Portfolio"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <Input
          label="Description"
          as="textarea"
          rows={3}
          placeholder="What are you building, and why?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Input
          label="Tech stack"
          placeholder="Next.js, Tailwind CSS, TypeScript"
          value={techStack}
          onChange={(event) => setTechStack(event.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Status"
            as="select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="planning">Planning</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </Input>
          <Input
            label="Priority"
            as="select"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Input>
          <Input
            label="Deadline"
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
          <Input
            label="Progress %"
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(event) => setProgress(Number(event.target.value))}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save project"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
