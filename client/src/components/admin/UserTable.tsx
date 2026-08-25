import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import type { User } from "@/src/types";

type UserTableProps = {
  users: User[];
};

export function UserTable({ users }: UserTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-bezel">
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Name
              </th>
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Email
              </th>
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Role
              </th>
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Target
              </th>
              <th className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim">
                Readiness
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-bezel last:border-0">
                <td className="py-4 pr-4 font-semibold text-ink">{user.name}</td>
                <td className="py-4 pr-4 text-ink-dim">{user.email}</td>
                <td className="py-4 pr-4">
                  <Badge tone={user.role === "admin" ? "beacon" : "neutral"}>{user.role}</Badge>
                </td>
                <td className="py-4 pr-4 text-ink-dim">{user.targetRole}</td>
                <td className="py-4 pr-4 font-display text-ink">{user.readinessScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
