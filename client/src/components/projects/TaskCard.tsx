import { Badge } from "@/src/components/ui/Badge";
import type { Task } from "@/src/types";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {task.title}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Due {task.dueDate}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone={task.status === "done" ? "green" : "indigo"}>
          {task.status}
        </Badge>
        <Badge tone={task.priority === "high" ? "rose" : "amber"}>
          {task.priority}
        </Badge>
      </div>
    </div>
  );
}
