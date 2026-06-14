import { AdminShell } from "@/src/components/layout/AdminShell";
import { AdminProjectTable } from "@/src/components/admin/AdminProjectTable";
import { mockProjects } from "@/src/data/mockData";

export default function AdminProjectsPage() {
  return (
    <AdminShell title="Project Monitoring" description="Static project health and progress table.">
      <AdminProjectTable projects={mockProjects} />
    </AdminShell>
  );
}
