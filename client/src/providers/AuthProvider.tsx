"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useEffect, useMemo, useState } from "react";

import { auth } from "@/src/lib/firebase";
import { getAuthToken } from "@/src/lib/authToken";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialized literally rather than from auth.currentUser so the first client
  // render matches the server render and hydration stays clean.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      getIdToken: () => getAuthToken(),
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
