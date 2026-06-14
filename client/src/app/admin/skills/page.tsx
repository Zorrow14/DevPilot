import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminAnalyticsCard } from "@/src/components/admin/AdminAnalyticsCard";
import { mockSkills } from "@/src/data/mockData";

export default function AdminSkillsPage() {
  return (
    <AdminShell title="Skill Analytics" description="Static skill distribution and progress placeholders.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockSkills.map((skill) => (
          <AdminAnalyticsCard
            key={skill.id}
            title={skill.name}
            subtitle={skill.category}
            value={skill.progress}
            badge={skill.level}
          />
        ))}
      </div>
    </AdminShell>
  );
}
