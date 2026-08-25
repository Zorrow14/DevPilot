import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import type { Task } from "@/src/types";

type UpcomingTasksProps = {
  tasks: Task[];
};

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  const pendingTasks = tasks.filter((task) => !task.completed);

  if (pendingTasks.length === 0) {
    return (
      <EmptyState
        title="No upcoming tasks"
        description="Your next portfolio tasks will appear here."
      />
    );
  }

  return (
    <Card>
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Upcoming tasks
      </h2>
      <div className="mt-5 space-y-3">
        {pendingTasks.slice(0, 4).map((task) => (
          <div key={task.id} className="rounded-bezel border border-bezel bg-console-raised p-4">
            <p className="font-semibold text-ink">{task.title}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={task.priority === "high" ? "alert" : "beacon"}>{task.priority}</Badge>
              <Badge>{task.dueDate}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
