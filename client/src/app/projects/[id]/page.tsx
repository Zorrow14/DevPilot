import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { ProjectSummary } from "@/src/components/projects/ProjectSummary";
import { TaskList } from "@/src/components/projects/TaskList";
import { mockProjects, mockTasks } from "@/src/data/mockData";

export default function ProjectDetailsPage() {
  const project = mockProjects[0];
  const tasks = mockTasks.filter((task) => task.projectId === project.id);

  return (
    <AppShell
      title={project.title}
      description="Static project details view using local mock data."
      action={<Button href="#">Add Task</Button>}
    >
      <ProjectSummary project={project} />
      <TaskList tasks={tasks} />
    </AppShell>
  );
}
