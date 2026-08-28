"use client";

import { useState, type FormEvent } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";
import { formatRelativeDate } from "@/src/lib/dates";
import type { Announcement } from "@/src/types";

type AnnouncementPanelProps = {
  announcements: Announcement[];
  onChanged: () => void;
};

export function AnnouncementPanel({ announcements, onChanged }: AnnouncementPanelProps) {
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Loading the form is done here rather than in an effect keyed on `editing`:
  // syncing state from a prop means a background reload returning an
  // equal-but-new object would overwrite whatever the admin had already typed.
  function startEditing(announcement: Announcement) {
    setEditing(announcement);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setError(null);
  }

  function resetForm() {
    setEditing(null);
    setTitle("");
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (editing) {
        await api.updateAnnouncement(editing.id, { title, message });
      } else {
        await api.createAnnouncement({ title, message });
      }

      resetForm();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save announcement.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setPendingId(id);

    try {
      await api.deleteAnnouncement(id);

      if (editing?.id === id) {
        resetForm();
      }

      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete announcement.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
          {editing ? "Edit announcement" : "Create announcement"}
        </h2>

        <p className="mt-3 text-sm text-ink-dim">
          Published announcements appear on every user&apos;s dashboard.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
              {error}
            </p>
          ) : null}

          <Input
            label="Title"
            placeholder="Scheduled maintenance"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <Input
            label="Message"
            as="textarea"
            rows={5}
            placeholder="Write a short platform update"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editing ? "Save changes" : "Publish announcement"}
            </Button>
            {editing ? (
              <Button type="button" variant="secondary" onClick={resetForm} disabled={isSaving}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <EmptyState
            title="No announcements yet"
            description="Anything you publish will show on every user's dashboard."
          />
        ) : (
          announcements.map((announcement) => {
            const posted = formatRelativeDate(announcement.createdAt);

            return (
              <Card key={announcement.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="letterpress font-bold text-ink">{announcement.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink-dim">{announcement.message}</p>
                  </div>
                  {announcement.id === editing?.id ? <Badge tone="beacon">Editing</Badge> : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-bezel pt-3">
                  <p className="text-sm text-ink-dim">
                    {announcement.createdByName || "Unknown"} &middot;{" "}
                    {posted ?? announcement.createdAt}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => startEditing(announcement)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(announcement.id)}
                      disabled={pendingId === announcement.id}
                    >
                      {pendingId === announcement.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
