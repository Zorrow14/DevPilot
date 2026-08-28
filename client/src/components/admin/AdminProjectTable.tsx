"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { api, type AdminProject } from "@/src/lib/api";

type AdminProjectTableProps = {
  projects: AdminProject[];
  onChanged: () => void;
};

const statusTones = {
  planning: "neutral",
  "in-progress": "heading",
  completed: "nominal",
} as const;
const priorityTones = { low: "neutral", medium: "beacon", high: "alert" } as const;

export function AdminProjectTable({ projects, onChanged }: AdminProjectTableProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(project: AdminProject) {
    // Deleting someone else's project also cascades their tasks, so it asks
    // first — this is the one destructive control on the admin surface.
    const confirmed = window.confirm(
      `Delete "${project.title}" belonging to ${project.ownerName}? Its ${project.taskCount} task(s) will be removed too.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setPendingId(project.id);

    try {
      await api.deleteAdminProject(project.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove project.");
    } finally {
      setPendingId(null);
    }
  }

  if (projects.length === 0) {
    return (
      <Card elevation="flat">
        <p className="text-sm text-ink-dim">No projects match these filters.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" elevation="flat">
      {error ? <p className="mb-4 text-sm text-alert">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-bezel">
              {["Project", "Owner", "Status", "Priority", "Deadline", "Progress", ""].map(
                (heading, index) => (
                  <th
                    key={heading || `actions-${index}`}
                    className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-bezel last:border-0 align-middle">
                <td className="py-4 pr-4">
                  <p className="font-semibold text-ink">{project.title}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{project.taskCount} tasks</p>
                </td>
                <td className="py-4 pr-4">
                  <p className="text-ink-dim">{project.ownerName}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{project.ownerEmail}</p>
                </td>
                <td className="py-4 pr-4">
                  <Badge tone={statusTones[project.status]}>{project.status}</Badge>
                </td>
                <td className="py-4 pr-4">
                  <Badge tone={priorityTones[project.priority]}>{project.priority}</Badge>
                </td>
                <td className="py-4 pr-4 text-ink-dim">{project.deadline || "—"}</td>
                <td className="py-4 pr-4">
                  <div className="w-40">
                    <ProgressBar value={project.progress} />
                  </div>
                </td>
                <td className="py-4 pr-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(project)}
                    disabled={pendingId === project.id}
                  >
                    {pendingId === project.id ? "Removing..." : "Remove"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
