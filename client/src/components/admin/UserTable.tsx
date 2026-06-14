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
          <thead className="text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="py-3 pr-4 font-semibold">Name</th>
              <th className="py-3 pr-4 font-semibold">Email</th>
              <th className="py-3 pr-4 font-semibold">Role</th>
              <th className="py-3 pr-4 font-semibold">Target</th>
              <th className="py-3 pr-4 font-semibold">Readiness</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 last:border-0 dark:border-slate-700"
              >
                <td className="py-4 pr-4 font-semibold text-slate-900 dark:text-slate-100">
                  {user.name}
                </td>
                <td className="py-4 pr-4">{user.email}</td>
                <td className="py-4 pr-4">
                  <Badge tone={user.role === "admin" ? "indigo" : "slate"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="py-4 pr-4">{user.targetRole}</td>
                <td className="py-4 pr-4">{user.readinessScore}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
