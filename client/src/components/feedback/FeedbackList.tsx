"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { api } from "@/src/lib/api";
import { formatRelativeDate } from "@/src/lib/dates";
import type { Feedback, FeedbackStatus } from "@/src/types";

type FeedbackListProps = {
  feedback: Feedback[];
  onChanged: () => void;
};

const statusTones: Record<FeedbackStatus, "beacon" | "heading" | "nominal" | "alert"> = {
  new: "beacon",
  "in-review": "heading",
  resolved: "nominal",
  rejected: "alert",
};

/** What each status means to the person who submitted it, not to the triager. */
const statusCopy: Record<FeedbackStatus, string> = {
  new: "Waiting to be read",
  "in-review": "Being looked at",
  resolved: "Resolved",
  rejected: "Closed without action",
};

export function FeedbackList({ feedback, onChanged }: FeedbackListProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setError(null);
    setPendingId(id);

    try {
      await api.deleteFeedback(id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to withdraw feedback.");
    } finally {
      setPendingId(null);
    }
  }

  if (feedback.length === 0) {
    return (
      <EmptyState
        title="No feedback sent yet"
        description="Anything you send will show up here with its status."
      />
    );
  }

  return (
    <Card>
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Your submissions
      </h2>

      {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}

      <div className="mt-5 space-y-4">
        {feedback.map((item) => {
          const submitted = formatRelativeDate(item.createdAt);

          return (
            <div
              key={item.id}
              className="rounded-bezel border border-bezel bg-console-raised p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-ink">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-ink-faint">
                    Sent {submitted ?? item.createdAt}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{item.type}</Badge>
                  <Badge tone={statusTones[item.status]}>{statusCopy[item.status]}</Badge>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-ink-dim">{item.message}</p>

              <div className="mt-3 flex justify-end border-t border-bezel pt-3">
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  disabled={pendingId === item.id}
                >
                  {pendingId === item.id ? "Withdrawing..." : "Withdraw"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
