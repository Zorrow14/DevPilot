"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";
import { formatRelativeDate } from "@/src/lib/dates";
import type { Feedback, FeedbackStatus } from "@/src/types";

type FeedbackTableProps = {
  feedback: Feedback[];
  /** Omitted on the read-only overview panel, which has no triage control. */
  onChanged?: () => void;
};

const statusTones: Record<FeedbackStatus, "beacon" | "heading" | "nominal" | "alert"> = {
  new: "beacon",
  "in-review": "heading",
  resolved: "nominal",
  rejected: "alert",
};

const STATUSES: FeedbackStatus[] = ["new", "in-review", "resolved", "rejected"];

export function FeedbackTable({ feedback, onChanged }: FeedbackTableProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: FeedbackStatus) {
    setError(null);
    setPendingId(id);

    try {
      await api.setFeedbackStatus(id, status);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update status.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card className="overflow-hidden" elevation="flat">
      {error ? <p className="mb-4 text-sm text-alert">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-bezel">
              {["User", "Type", "Feedback", "Status", "Submitted"].map((heading) => (
                <th
                  key={heading}
                  className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => {
              const submitted = formatRelativeDate(item.createdAt);

              return (
                <tr key={item.id} className="border-b border-bezel last:border-0 align-top">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-ink">{item.userName || "Unknown"}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{item.userEmail}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge>{item.type}</Badge>
                  </td>
                  <td className="max-w-md py-4 pr-4">
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 leading-6 text-ink-dim">{item.message}</p>
                  </td>
                  <td className="py-4 pr-4">
                    {onChanged ? (
                      <Input
                        label="Status"
                        hideLabel
                        as="select"
                        value={item.status}
                        disabled={pendingId === item.id}
                        onChange={(event) =>
                          handleStatusChange(item.id, event.target.value as FeedbackStatus)
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Input>
                    ) : (
                      <Badge tone={statusTones[item.status]}>{item.status}</Badge>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-ink-dim">{submitted ?? item.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
