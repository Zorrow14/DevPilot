"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { Button } from "@/src/components/ui/Button";
import { auth } from "@/src/lib/firebase";
import { routes } from "@/src/constants/routes";
import { useAuth } from "@/src/hooks/useAuth";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  async function handleLogout() {
    await signOut(auth);
    router.push(routes.login);
  }

  if (loading || !user) {
    return null;
  }

  return (
    <Button variant="secondary" className={className} onClick={handleLogout}>
      Logout
    </Button>
  );
}
