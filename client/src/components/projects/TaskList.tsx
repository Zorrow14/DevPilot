"use client";

import { useMemo, useState } from "react";

import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { Input } from "@/src/components/ui/Input";
import type { Task } from "@/src/types";
import { TaskCard } from "./TaskCard";

type TaskListProps = {
  tasks: Task[];
  onChanged: () => void;
};

const ALL = "all";

export function TaskList({ tasks, onChanged }: TaskListProps) {
  const [status, setStatus] = useState(ALL);
  const [priority, setPriority] = useState(ALL);

  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (status === ALL || task.status === status) &&
          (priority === ALL || task.priority === priority),
      ),
    [tasks, status, priority],
  );

  // The empty state for "no tasks at all" is a different message from "no
  // tasks match your filters", so it is checked before filtering.
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Use Add Task to break this project into steps."
        className="mt-6"
      />
    );
  }

  const openCount = tasks.filter((task) => !task.completed).length;
  const isFiltered = status !== ALL || priority !== ALL;

  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
          Task list
        </h2>
        <span className="font-display text-micro uppercase tracking-wider text-ink-dim">
          {isFiltered ? `${visibleTasks.length} shown / ` : ""}
          {openCount} open / {tasks.length} total
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input
          label="Filter by status"
          as="select"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value={ALL}>All statuses</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </Input>
        <Input
          label="Filter by priority"
          as="select"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value={ALL}>All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Input>
      </div>

      <div className="mt-5 space-y-3">
        {visibleTasks.length === 0 ? (
          <p className="text-sm text-ink-dim">No tasks match the current filters.</p>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} onChanged={onChanged} />
          ))
        )}
      </div>
    </Card>
  );
}
