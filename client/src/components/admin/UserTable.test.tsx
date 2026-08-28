import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserTable } from "./UserTable";
import type { AdminUser } from "@/src/lib/api";

const setUserRole = vi.fn();
const setUserStatus = vi.fn();

vi.mock("@/src/lib/api", () => ({
  api: {
    setUserRole: (...args: unknown[]) => setUserRole(...args),
    setUserStatus: (...args: unknown[]) => setUserStatus(...args),
  },
}));

function makeUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: "user-1",
    name: "Ada",
    email: "ada@example.com",
    imageUrl: null,
    role: "user",
    status: "active",
    targetRole: "Frontend Intern",
    preferredStack: ["React"],
    readinessScore: 61,
    skillCount: 4,
    projectCount: 2,
    createdAt: "2026-01-01",
    ...overrides,
  };
}

beforeEach(() => {
  setUserRole.mockResolvedValue(undefined);
  setUserStatus.mockResolvedValue(undefined);
});

describe("UserTable", () => {
  it("promotes a user to admin", async () => {
    render(<UserTable users={[makeUser()]} currentUserId="admin-1" onChanged={vi.fn()} />);

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /role for ada/i }), "admin");

    await waitFor(() => expect(setUserRole).toHaveBeenCalledWith("user-1", "admin"));
  });

  it("deactivates a user", async () => {
    render(<UserTable users={[makeUser()]} currentUserId="admin-1" onChanged={vi.fn()} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /status for ada/i }),
      "inactive",
    );

    await waitFor(() => expect(setUserStatus).toHaveBeenCalledWith("user-1", "inactive"));
  });

  it("disables both controls on the signed-in admin's own row", async () => {
    // The server rejects self-demotion and self-deactivation anyway; disabling
    // here says so before the click rather than after.
    render(
      <UserTable
        users={[makeUser({ id: "admin-1", name: "Grace", role: "admin" })]}
        currentUserId="admin-1"
        onChanged={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: /role for grace/i })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: /status for grace/i })).toBeDisabled();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("leaves other admins editable", () => {
    render(
      <UserTable
        users={[makeUser({ id: "user-2", name: "Linus", role: "admin" })]}
        currentUserId="admin-1"
        onChanged={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox", { name: /role for linus/i })).not.toBeDisabled();
  });

  it("surfaces a rejected change rather than appearing to succeed", async () => {
    setUserRole.mockRejectedValue(new Error("You cannot remove your own administrator access."));
    const onChanged = vi.fn();
    render(<UserTable users={[makeUser()]} currentUserId="admin-1" onChanged={onChanged} />);

    await userEvent.selectOptions(screen.getByRole("combobox", { name: /role for ada/i }), "admin");

    expect(
      await screen.findByText("You cannot remove your own administrator access."),
    ).toBeInTheDocument();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("shows a placeholder rather than a blank cell for an undecided target role", () => {
    render(<UserTable users={[makeUser({ targetRole: "" })]} onChanged={vi.fn()} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
