"use client";

import { useState } from "react";

import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { api, type AdminUser } from "@/src/lib/api";

type UserTableProps = {
  users: AdminUser[];
  /** The signed-in admin, so the row that would lock them out can be disabled. */
  currentUserId?: string;
  onChanged: () => void;
};

export function UserTable({ users, currentUserId, onChanged }: UserTableProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function run(id: string, action: () => Promise<unknown>) {
    setError(null);
    setPendingId(id);

    try {
      await action();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update user.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card className="overflow-hidden" elevation="flat">
      {error ? <p className="mb-4 text-sm text-alert">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-bezel">
              {["User", "Role", "Status", "Target", "Work", "Readiness"].map((heading) => (
                <th
                  key={heading}
                  className="py-3 pr-4 font-display text-micro font-bold uppercase tracking-wider text-ink-dim"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isBusy = pendingId === user.id;

              return (
                <tr key={user.id} className="border-b border-bezel last:border-0 align-middle">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-ink">{user.name}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">{user.email}</p>
                  </td>
                  <td className="py-4 pr-4">
                    {/*
                      An admin cannot demote or deactivate themselves — the server
                      rejects it too, but disabling the control says so before the
                      click rather than after.
                    */}
                    <Input
                      label={`Role for ${user.name}`}
                      hideLabel
                      as="select"
                      value={user.role}
                      disabled={isBusy || isSelf}
                      onChange={(event) =>
                        run(user.id, () =>
                          api.setUserRole(user.id, event.target.value as "user" | "admin"),
                        )
                      }
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </Input>
                  </td>
                  <td className="py-4 pr-4">
                    <Input
                      label={`Status for ${user.name}`}
                      hideLabel
                      as="select"
                      value={user.status}
                      disabled={isBusy || isSelf}
                      onChange={(event) =>
                        run(user.id, () =>
                          api.setUserStatus(user.id, event.target.value as "active" | "inactive"),
                        )
                      }
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </Input>
                  </td>
                  <td className="py-4 pr-4 text-ink-dim">{user.targetRole || "—"}</td>
                  <td className="py-4 pr-4 text-ink-dim">
                    {user.skillCount} skills &middot; {user.projectCount} projects
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-ink">
                        {user.readinessScore}%
                      </span>
                      {isSelf ? <Badge tone="beacon">You</Badge> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
