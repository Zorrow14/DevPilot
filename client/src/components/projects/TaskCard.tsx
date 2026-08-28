"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { api } from "@/src/lib/api";
import type { Task } from "@/src/types";
import { TaskEditForm } from "./TaskEditForm";

type TaskCardProps = {
  task: Task;
  onChanged: () => void;
};

const statusTones = { todo: "neutral", "in-progress": "heading", done: "nominal" } as const;
const priorityTones = { low: "neutral", medium: "beacon", high: "alert" } as const;

export function TaskCard({ task, onChanged }: TaskCardProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>, failure: string) {
    setError(null);
    setIsBusy(true);

    try {
      await action();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : failure);
      setIsBusy(false);
    }
  }

  if (isEditing) {
    return (
      <TaskEditForm
        task={task}
        onSaved={() => {
          setIsEditing(false);
          onChanged();
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-bezel border border-bezel bg-console-raised p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className={
              task.completed ? "font-semibold text-ink-dim line-through" : "font-semibold text-ink"
            }
          >
            {task.title}
          </p>
          {task.description ? (
            <p className="mt-1 text-sm leading-6 text-ink-dim">{task.description}</p>
          ) : null}
          {task.dueDate ? <p className="mt-1 text-sm text-ink-dim">Due {task.dueDate}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTones[task.status]}>{task.status}</Badge>
          <Badge tone={priorityTones[task.priority]}>{task.priority}</Badge>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}

      <div className="mt-3 flex flex-wrap justify-end gap-1 border-t border-bezel pt-3">
        <Button
          variant="ghost"
          disabled={isBusy}
          onClick={() =>
            run(
              () => api.updateTask(task.id, { status: task.completed ? "todo" : "done" }),
              "Unable to update task.",
            )
          }
        >
          {task.completed ? "Reopen" : "Mark done"}
        </Button>
        <Button variant="ghost" disabled={isBusy} onClick={() => setIsEditing(true)}>
          Edit
        </Button>
        <Button
          variant="ghost"
          disabled={isBusy}
          onClick={() => run(() => api.deleteTask(task.id), "Unable to delete task.")}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
