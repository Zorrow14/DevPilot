"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Card } from "@/src/components/ui/Card";
import { routes } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";

type RequireAuthProps = {
  children: React.ReactNode;
  /**
   * Gate the subtree to ADMIN accounts. This mirrors the server's `requireAdmin`
   * middleware — it is a navigation convenience, not the security boundary. The
   * API refuses non-admins regardless of what the client renders.
   */
  requireAdmin?: boolean;
};

export function RequireAuth({ children, requireAdmin = false }: RequireAuthProps) {
  const router = useRouter();
  const { user, loading, profile, profileLoading } = useAuth();

  // Matches the login page, which signs unverified accounts back out rather
  // than letting them through. Google accounts arrive already verified.
  const isAuthenticated = Boolean(user?.emailVerified);

  // Only block on the profile when the role actually gates this subtree.
  const needsProfile = requireAdmin && isAuthenticated;
  const isCheckingRole = needsProfile && profileLoading;
  const isAllowed = isAuthenticated && (!requireAdmin || profile?.role === "ADMIN");

  useEffect(() => {
    if (loading || isCheckingRole) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(routes.login);
      return;
    }

    if (!isAllowed) {
      router.replace(routes.dashboard);
    }
  }, [loading, isCheckingRole, isAuthenticated, isAllowed, router]);

  if (loading || isCheckingRole || !isAllowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-panel px-6 py-12 text-ink">
        <Card className="w-full max-w-md text-center text-sm text-ink-dim">
          {loading || isCheckingRole
            ? "Checking your session..."
            : isAuthenticated
              ? "Administrator access is required. Returning to your dashboard..."
              : "Redirecting to login..."}
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
