import { Badge } from "@/src/components/ui/Badge";
import type { Task } from "@/src/types";

type TaskCardProps = {
  task: Task;
};

const statusTones = { todo: "neutral", "in-progress": "heading", done: "nominal" } as const;
const priorityTones = { low: "neutral", medium: "beacon", high: "alert" } as const;

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-bezel border border-bezel bg-console-raised p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-ink">{task.title}</p>
        <p className="mt-1 text-sm text-ink-dim">Due {task.dueDate}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone={statusTones[task.status]}>{task.status}</Badge>
        <Badge tone={priorityTones[task.priority]}>{task.priority}</Badge>
      </div>
    </div>
  );
}
