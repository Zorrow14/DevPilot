"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { SkillFilters } from "@/src/components/skills/SkillFilters";
import { SkillList } from "@/src/components/skills/SkillList";
import { api } from "@/src/lib/api";
import type { Skill } from "@/src/types";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        setSkills(await api.getSkills());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load skills.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSkills();
  }, []);

  return (
    <AppShell
      title="Skills"
      description="Track your learning areas, confidence level, and recent practice rhythm."
      action={<Button href="#">Add Skill</Button>}
    >
      <SkillFilters />
      {isLoading ? (
        <Card>Loading skills...</Card>
      ) : error ? (
        <EmptyState title="Skills unavailable" description={error} />
      ) : (
        <SkillList skills={skills} />
      )}
    </AppShell>
  );
}
