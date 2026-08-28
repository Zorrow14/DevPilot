"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { FieldError } from "@/src/components/ui/FieldError";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";
import { parseTechStack, projectEditSchema, type ProjectEditValues } from "@/src/lib/schemas";
import type { Project } from "@/src/types";

type ProjectEditFormProps = {
  project: Project;
  onSaved: () => void;
  onCancel: () => void;
};

export function ProjectEditForm({ project, onSaved, onCancel }: ProjectEditFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectEditValues>({
    resolver: zodResolver(projectEditSchema),
    defaultValues: {
      title: project.title,
      description: project.description,
      techStack: project.techStack.join(", "),
      status: project.status,
      priority: project.priority,
      deadline: project.deadline,
      progress: project.progress,
    },
  });

  async function onSubmit(values: ProjectEditValues) {
    setError(null);

    try {
      await api.updateProject(project.id, {
        title: values.title,
        description: values.description || null,
        techStack: parseTechStack(values.techStack),
        status: values.status,
        priority: values.priority,
        // Empty means "no deadline" — null clears it, where "" would be
        // rejected as an invalid date.
        deadline: values.deadline || null,
        progress: values.progress,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save project.");
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Edit project
      </h2>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error ? (
          <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
            {error}
          </p>
        ) : null}

        <div>
          <Input label="Title" {...register("title")} />
          <FieldError message={errors.title?.message} />
        </div>
        <div>
          <Input label="Description" as="textarea" rows={3} {...register("description")} />
          <FieldError message={errors.description?.message} />
        </div>
        <div>
          <Input
            label="Tech stack"
            placeholder="Next.js, Tailwind CSS, TypeScript"
            {...register("techStack")}
          />
          <FieldError message={errors.techStack?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input label="Status" as="select" {...register("status")}>
              <option value="planning">Planning</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </Input>
            <FieldError message={errors.status?.message} />
          </div>
          <div>
            <Input label="Priority" as="select" {...register("priority")}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Input>
            <FieldError message={errors.priority?.message} />
          </div>
          <div>
            <Input label="Deadline" type="date" {...register("deadline")} />
            <FieldError message={errors.deadline?.message} />
          </div>
          <div>
            <Input
              label="Progress %"
              type="number"
              min={0}
              max={100}
              {...register("progress", { valueAsNumber: true })}
            />
            <FieldError message={errors.progress?.message} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
