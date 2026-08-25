"use client";

import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";

type SkillFiltersProps = {
  search: string;
  category: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export const ALL_CATEGORIES = "all";

export function SkillFilters({
  search,
  category,
  categories,
  onSearchChange,
  onCategoryChange,
}: SkillFiltersProps) {
  return (
    <Card className="mb-6">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <Input
          placeholder="Search skills"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <Input
          as="select"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value={ALL_CATEGORIES}>All categories</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Input>
      </div>
    </Card>
  );
}
