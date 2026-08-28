"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/src/components/ui/Button";
import { FieldError } from "@/src/components/ui/FieldError";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";
import { taskEditSchema, type TaskEditValues } from "@/src/lib/schemas";
import type { Task } from "@/src/types";

type TaskEditFormProps = {
  task: Task;
  onSaved: () => void;
  onCancel: () => void;
};

export function TaskEditForm({ task, onSaved, onCancel }: TaskEditFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskEditValues>({
    resolver: zodResolver(taskEditSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    },
  });

  async function onSubmit(values: TaskEditValues) {
    setError(null);

    try {
      await api.updateTask(task.id, {
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save task.");
    }
  }

  return (
    <form
      className="space-y-4 rounded-bezel border border-bezel bg-console-raised p-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {error ? (
        <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
          {error}
        </p>
      ) : null}

      <div>
        <Input label="Task" {...register("title")} />
        <FieldError message={errors.title?.message} />
      </div>
      <div>
        <Input label="Details" as="textarea" rows={2} {...register("description")} />
        <FieldError message={errors.description?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Input label="Status" as="select" {...register("status")}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
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
          <Input label="Due date" type="date" {...register("dueDate")} />
          <FieldError message={errors.dueDate?.message} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save task"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
