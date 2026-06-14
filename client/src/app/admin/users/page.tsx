import { AdminShell } from "@/src/components/layout/AdminShell";
import { UserTable } from "@/src/components/admin/UserTable";
import { mockAdminUsers } from "@/src/data/mockData";

export default function AdminUsersPage() {
  return (
    <AdminShell title="Users" description="Static user monitoring table.">
      <UserTable users={mockAdminUsers} />
    </AdminShell>
  );
}
