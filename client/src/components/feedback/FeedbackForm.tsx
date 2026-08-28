"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";

type FeedbackFormProps = {
  onSubmitted: () => void;
};

const TYPES = [
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature request" },
  { value: "general", label: "General feedback" },
];

export function FeedbackForm({ onSubmitted }: FeedbackFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await api.createFeedback({ title, message, type });
      setTitle("");
      setMessage("");
      setType("general");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send feedback.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Send feedback
      </h2>
      <p className="mt-3 text-sm text-ink-dim">
        Report a bug, request a feature, or tell us what is not working for you.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
            {error}
          </p>
        ) : null}

        <Input
          label="Title"
          placeholder="Readiness gauge takes a while to load"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <Input
          label="Type"
          as="select"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          {TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Input>
        <Input
          label="Details"
          as="textarea"
          rows={5}
          placeholder="What happened, and what did you expect instead?"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Sending..." : "Send feedback"}
        </Button>
      </form>
    </Card>
  );
}
