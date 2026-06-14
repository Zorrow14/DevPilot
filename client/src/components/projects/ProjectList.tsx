import { EmptyState } from "@/src/components/ui/EmptyState";
import type { Project } from "@/src/types";
import { ProjectCard } from "./ProjectCard";

type ProjectListProps = {
  projects: Project[];
};

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Your project cards will appear here."
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
