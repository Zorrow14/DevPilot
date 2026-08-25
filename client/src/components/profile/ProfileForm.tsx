"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { ApiError, api, type UserProfile } from "@/src/lib/api";

type ProfileFormProps = {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
  onCancel: () => void;
};

export function ProfileForm({ profile, onSaved, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [targetRole, setTargetRole] = useState(profile.targetRole ?? "");
  const [preferredStack, setPreferredStack] = useState(profile.preferredStack.join(", "));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const saved = await api.updateMe({
        name,
        targetRole,
        preferredStack: preferredStack
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      });

      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error ? err.message : "Unable to save profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="mt-8 space-y-4 border-t border-bezel pt-6" onSubmit={handleSubmit}>
      {error ? (
        <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
          {error}
        </p>
      ) : null}

      <Input
        label="Display name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Input
        label="Target role"
        placeholder="Frontend Developer Intern"
        value={targetRole}
        onChange={(event) => setTargetRole(event.target.value)}
      />
      <Input
        label="Preferred stack"
        placeholder="Next.js, TypeScript, PostgreSQL"
        value={preferredStack}
        onChange={(event) => setPreferredStack(event.target.value)}
      />
      <p className="text-sm text-ink-dim">Separate stack entries with commas.</p>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
