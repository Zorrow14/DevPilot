"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { ALL_CATEGORIES, SkillFilters } from "@/src/components/skills/SkillFilters";
import { SkillForm } from "@/src/components/skills/SkillForm";
import { SkillList } from "@/src/components/skills/SkillList";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function SkillsPage() {
  const { data, error, isLoading, reload } = useApiResource((signal) => api.getSkills(signal));
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);

  const skills = useMemo(() => data ?? [], [data]);

  // Offer only categories the user actually has, so the filter can never select
  // an option that yields nothing.
  const categories = useMemo(
    () => Array.from(new Set(skills.map((skill) => skill.category))).sort(),
    [skills],
  );

  const visibleSkills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return skills.filter((skill) => {
      const matchesCategory = category === ALL_CATEGORIES || skill.category === category;
      const matchesQuery = !query || skill.name.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [skills, search, category]);

  const isFiltered = search.trim() !== "" || category !== ALL_CATEGORIES;

  return (
    <AppShell
      title="Skills"
      description="Track your learning areas, confidence level, and recent practice rhythm."
      action={
        <Button onClick={() => setIsAdding((value) => !value)}>
          {isAdding ? "Close" : "Add Skill"}
        </Button>
      }
    >
      {isAdding ? (
        <SkillForm
          onSaved={() => {
            setIsAdding(false);
            reload();
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : null}

      <SkillFilters
        search={search}
        category={category}
        categories={categories}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
      />

      {isLoading ? (
        <Card>Loading skills...</Card>
      ) : error ? (
        <EmptyState title="Skills unavailable" description={error} />
      ) : (
        <SkillList
          skills={visibleSkills}
          onChanged={reload}
          emptyDescription={
            isFiltered
              ? "No skills match the current search and category."
              : "Use Add Skill to start tracking what you're learning."
          }
        />
      )}
    </AppShell>
  );
}
