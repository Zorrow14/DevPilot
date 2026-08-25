import { EmptyState } from "@/src/components/ui/EmptyState";
import type { Project } from "@/src/types";
import { ProjectCard } from "./ProjectCard";

type ProjectListProps = {
  projects: Project[];
  onChanged: () => void;
};

export function ProjectList({ projects, onChanged }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects yet"
        description="Use Add Project to start tracking a portfolio build."
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onChanged={onChanged} />
      ))}
    </div>
  );
}
