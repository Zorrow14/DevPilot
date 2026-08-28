import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthContext, type AuthContextValue } from "@/src/providers/AuthProvider";
import type { UserProfile } from "@/src/lib/api";
import { RequireAuth } from "./RequireAuth";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

function profileWithRole(role: UserProfile["role"]): UserProfile {
  return {
    id: "user-1",
    firebaseUid: "firebase-1",
    email: "dev@example.com",
    name: "Dev",
    imageUrl: null,
    targetRole: null,
    preferredStack: [],
    role,
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function renderGuard(context: Partial<AuthContextValue>, requireAdmin = false) {
  const value: AuthContextValue = {
    user: null,
    loading: false,
    profile: null,
    profileLoading: false,
    refreshProfile: vi.fn(),
    getIdToken: vi.fn(),
    ...context,
  };

  return render(
    <AuthContext.Provider value={value}>
      <RequireAuth requireAdmin={requireAdmin}>
        <p>protected content</p>
      </RequireAuth>
    </AuthContext.Provider>,
  );
}

// Only `emailVerified` is read off the Firebase user, so a partial stand-in is
// enough and avoids constructing a full Firebase User.
const verifiedUser = { emailVerified: true } as AuthContextValue["user"];
const unverifiedUser = { emailVerified: false } as AuthContextValue["user"];

describe("RequireAuth", () => {
  it("renders children for a verified user", () => {
    renderGuard({ user: verifiedUser });

    expect(screen.getByText("protected content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects an unverified account to login", () => {
    // The login page signs unverified accounts back out, so the guard must
    // agree rather than letting them linger on a protected page.
    renderGuard({ user: unverifiedUser });

    expect(screen.queryByText("protected content")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("waits while the session is still loading", () => {
    renderGuard({ user: null, loading: true });

    expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  describe("requireAdmin", () => {
    it("renders children for an admin", () => {
      renderGuard({ user: verifiedUser, profile: profileWithRole("ADMIN") }, true);

      expect(screen.getByText("protected content")).toBeInTheDocument();
      expect(replace).not.toHaveBeenCalled();
    });

    it("redirects a non-admin to the dashboard", () => {
      renderGuard({ user: verifiedUser, profile: profileWithRole("USER") }, true);

      expect(screen.queryByText("protected content")).not.toBeInTheDocument();
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });

    it("does not redirect an admin while their profile is still loading", () => {
      // Regression guard: the role arrives from a second request, so there is a
      // window where the user is authenticated but the profile is not back yet.
      // Treating that window as "not an admin" bounces admins off their own
      // pages on every load.
      renderGuard({ user: verifiedUser, profile: null, profileLoading: true }, true);

      expect(screen.getByText(/checking your session/i)).toBeInTheDocument();
      expect(replace).not.toHaveBeenCalled();
    });

    it("redirects when the profile request failed", () => {
      // A settled-but-absent profile must fail closed, not fall through.
      renderGuard({ user: verifiedUser, profile: null, profileLoading: false }, true);

      expect(screen.queryByText("protected content")).not.toBeInTheDocument();
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });

    it("still sends an unauthenticated visitor to login, not the dashboard", () => {
      renderGuard({ user: null, profile: null }, true);

      expect(replace).toHaveBeenCalledWith("/login");
    });
  });
});
