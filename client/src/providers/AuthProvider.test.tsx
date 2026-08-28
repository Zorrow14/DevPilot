import { act, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UserProfile } from "@/src/lib/api";
import { AuthContext, AuthProvider } from "./AuthProvider";

const getMe = vi.fn();
let emitAuthState: (user: unknown) => void = () => {};

vi.mock("@/src/lib/api", () => ({
  api: { getMe: (...args: unknown[]) => getMe(...args) },
}));

vi.mock("@/src/lib/authToken", () => ({
  getAuthToken: vi.fn(async () => "token"),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, cb: (user: unknown) => void) => {
    emitAuthState = cb;
    return () => {};
  },
}));

const adminProfile: UserProfile = {
  id: "user-1",
  firebaseUid: "firebase-1",
  email: "admin@example.com",
  name: "Admin",
  imageUrl: null,
  targetRole: null,
  preferredStack: [],
  role: "ADMIN",
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

/** Renders the provider's derived state so assertions read off the DOM. */
function Probe() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    return <p>no context</p>;
  }

  return (
    <dl>
      <dd data-testid="loading">{String(ctx.loading)}</dd>
      <dd data-testid="profile-loading">{String(ctx.profileLoading)}</dd>
      <dd data-testid="role">{ctx.profile?.role ?? "none"}</dd>
    </dl>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    getMe.mockReset();
    getMe.mockResolvedValue(adminProfile);
  });

  it("reports profileLoading while the profile request is in flight", async () => {
    // Regression guard for the race this provider exists to avoid: between
    // Firebase reporting a verified user and GET /api/users/me returning, the
    // role is unknown. If that window reports profileLoading=false, the admin
    // route guard reads "no role" as "not an admin" and bounces admins off
    // their own pages on every load.
    getMe.mockReturnValue(new Promise(() => {}));

    renderProvider();

    await act(async () => {
      emitAuthState({ uid: "firebase-1", emailVerified: true });
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("profile-loading")).toHaveTextContent("true");
    expect(screen.getByTestId("role")).toHaveTextContent("none");
  });

  it("exposes the profile once the request resolves", async () => {
    renderProvider();

    await act(async () => {
      emitAuthState({ uid: "firebase-1", emailVerified: true });
    });

    await waitFor(() => expect(screen.getByTestId("role")).toHaveTextContent("ADMIN"));
    expect(screen.getByTestId("profile-loading")).toHaveTextContent("false");
  });

  it("settles with no profile when the request fails, rather than loading forever", async () => {
    getMe.mockRejectedValue(new Error("500"));

    renderProvider();

    await act(async () => {
      emitAuthState({ uid: "firebase-1", emailVerified: true });
    });

    await waitFor(() => expect(screen.getByTestId("profile-loading")).toHaveTextContent("false"));
    expect(screen.getByTestId("role")).toHaveTextContent("none");
  });

  it("does not request a profile for an unverified account", async () => {
    renderProvider();

    await act(async () => {
      emitAuthState({ uid: "firebase-1", emailVerified: false });
    });

    expect(getMe).not.toHaveBeenCalled();
    expect(screen.getByTestId("profile-loading")).toHaveTextContent("false");
  });

  it("does not request a profile when signed out", async () => {
    renderProvider();

    await act(async () => {
      emitAuthState(null);
    });

    expect(getMe).not.toHaveBeenCalled();
    expect(screen.getByTestId("role")).toHaveTextContent("none");
  });

  it("drops the previous user's profile when the account changes", async () => {
    renderProvider();

    await act(async () => {
      emitAuthState({ uid: "firebase-1", emailVerified: true });
    });
    await waitFor(() => expect(screen.getByTestId("role")).toHaveTextContent("ADMIN"));

    // A different uid must not keep showing the prior account's role.
    getMe.mockReturnValue(new Promise(() => {}));
    await act(async () => {
      emitAuthState({ uid: "firebase-2", emailVerified: true });
    });

    expect(screen.getByTestId("role")).toHaveTextContent("none");
    expect(screen.getByTestId("profile-loading")).toHaveTextContent("true");
  });
});
