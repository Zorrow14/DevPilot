"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";

type TaskFormProps = {
  projectId: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function TaskForm({ projectId, onSaved, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await api.createProjectTask(projectId, {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate || null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save task.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="mt-6">
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Add a task
      </h2>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
            {error}
          </p>
        ) : null}

        <Input
          label="Task"
          placeholder="Write portfolio hero copy"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <Input
          label="Details"
          as="textarea"
          rows={2}
          placeholder="Anything worth remembering about this step"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Status"
            as="select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
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
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save task"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
