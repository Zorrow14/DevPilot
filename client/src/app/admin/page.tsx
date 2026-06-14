import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminStats } from "@/src/components/admin/AdminStats";
import { AdminAnalyticsCard } from "@/src/components/admin/AdminAnalyticsCard";
import { FeedbackTable } from "@/src/components/admin/FeedbackTable";
import {
  mockAdminUsers,
  mockFeedback,
  mockProjects,
  mockRoadmaps,
  mockSkills,
} from "@/src/data/mockData";

export default function AdminPage() {
  return (
    <AdminShell
      title="Admin Overview"
      description="Static platform monitoring dashboard using local mock data."
    >
      <AdminStats
        users={mockAdminUsers}
        projects={mockProjects}
        skills={mockSkills}
        feedback={mockFeedback}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {mockRoadmaps.map((roadmap) => (
          <AdminAnalyticsCard
            key={roadmap.id}
            title={roadmap.title}
            subtitle={roadmap.targetRole}
            value={roadmap.steps.length * 25}
            badge={roadmap.duration}
          />
        ))}
        <AdminAnalyticsCard
          title="Skill coverage"
          subtitle="Mock distribution across tracked categories"
          value={82}
          badge={`${mockSkills.length} skills`}
        />
      </div>
      <div className="mt-6">
        <FeedbackTable feedback={mockFeedback} />
      </div>
    </AdminShell>
  );
}
