import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import type { Task } from "@/src/types";
import { TaskCard } from "./TaskCard";

type TaskListProps = {
  tasks: Task[];
};

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Project tasks will appear here."
      />
    );
  }

  return (
    <Card className="mt-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Task List
      </h2>
      <div className="mt-5 space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </Card>
  );
}
