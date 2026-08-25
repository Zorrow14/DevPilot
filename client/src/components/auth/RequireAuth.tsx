"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Card } from "@/src/components/ui/Card";
import { routes } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Matches the login page, which signs unverified accounts back out rather
  // than letting them through. Google accounts arrive already verified.
  const isAuthenticated = Boolean(user?.emailVerified);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(routes.login);
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-panel px-6 py-12 text-ink">
        <Card className="w-full max-w-md text-center text-sm text-ink-dim">
          {loading ? "Checking your session..." : "Redirecting to login..."}
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
