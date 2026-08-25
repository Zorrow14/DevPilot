import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import type { Task } from "@/src/types";
import { TaskCard } from "./TaskCard";

type TaskListProps = {
  tasks: Task[];
  onChanged: () => void;
};

export function TaskList({ tasks, onChanged }: TaskListProps) {
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

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
          Task list
        </h2>
        <span className="font-display text-micro uppercase tracking-wider text-ink-dim">
          {openCount} open / {tasks.length} total
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onChanged={onChanged} />
        ))}
      </div>
    </Card>
  );
}
