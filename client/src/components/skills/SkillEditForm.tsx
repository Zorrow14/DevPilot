"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SKILL_CATEGORIES } from "@/src/components/skills/SkillForm";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { FieldError } from "@/src/components/ui/FieldError";
import { Input } from "@/src/components/ui/Input";
import { api } from "@/src/lib/api";
import { skillEditSchema, type SkillEditValues } from "@/src/lib/schemas";
import type { Skill } from "@/src/types";

type SkillEditFormProps = {
  skill: Skill;
  onSaved: () => void;
  onCancel: () => void;
};

export function SkillEditForm({ skill, onSaved, onCancel }: SkillEditFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SkillEditValues>({
    resolver: zodResolver(skillEditSchema),
    // The component is mounted per-skill and unmounted on cancel, so the
    // current values are the right defaults; no syncing effect is needed.
    defaultValues: {
      name: skill.name,
      category: skill.category,
      level: skill.level,
      progress: skill.progress,
      notes: skill.notes ?? "",
    },
  });

  async function onSubmit(values: SkillEditValues) {
    setError(null);

    try {
      await api.updateSkill(skill.id, {
        name: values.name,
        category: values.category,
        level: values.level,
        progress: values.progress,
        notes: values.notes || null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save skill.");
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
        Edit skill
      </h2>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error ? (
          <p className="rounded-bezel border border-alert-dim bg-alert-dim/20 px-4 py-3 text-sm text-alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Input label="Skill name" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Input label="Category" as="select" {...register("category")}>
              {/* Includes the skill's own category even if it is not one of the
                  presets, so editing cannot silently recategorise it. */}
              {Array.from(new Set([skill.category, ...SKILL_CATEGORIES])).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Input>
            <FieldError message={errors.category?.message} />
          </div>
          <div>
            <Input label="Level" as="select" {...register("level")}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Input>
            <FieldError message={errors.level?.message} />
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

        <div>
          <Input label="Notes" as="textarea" rows={3} {...register("notes")} />
          <FieldError message={errors.notes?.message} />
        </div>

        <p className="text-sm text-ink-dim">
          Changing progress records today as your last practice date.
        </p>

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
