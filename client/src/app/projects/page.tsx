import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { ProjectList } from "@/src/components/projects/ProjectList";
import { mockProjects } from "@/src/data/mockData";

export default function ProjectsPage() {
  return (
    <AppShell
      title="Projects"
      description="Plan portfolio work, deadlines, priorities, and implementation progress."
      action={<Button href="#">Add Project</Button>}
    >
      <ProjectList projects={mockProjects} />
    </AppShell>
  );
}
