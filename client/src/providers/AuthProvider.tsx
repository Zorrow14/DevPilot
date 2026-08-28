"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { auth } from "@/src/lib/firebase";
import { getAuthToken } from "@/src/lib/authToken";
import { api, type UserProfile } from "@/src/lib/api";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  /**
   * The Postgres user row (role, status, preferences). Held here rather than
   * fetched per-component because both the admin route guard and the sidebar
   * need the role — this keeps it to one request per session.
   *
   * Null while loading, and also whenever the profile request failed; callers
   * must not read `profileLoading === false` as "profile is present".
   */
  profile: UserProfile | null;
  profileLoading: boolean;
  refreshProfile: () => void;
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
  // Tagged with the uid it was fetched for, so "loading" is derived rather than
  // stored — a result belonging to a previous user (or to no user yet) is simply
  // not shown. Storing a boolean instead leaves a render where the profile has
  // not been requested yet but already reads as settled, which would flash an
  // admin past the role gate. Same pattern as hooks/useApiResource.ts.
  const [profileResult, setProfileResult] = useState<{
    uid: string;
    profile: UserProfile | null;
  } | null>(null);
  const [profileNonce, setProfileNonce] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  // Unverified accounts are refused by the API anyway, so only fetch once
  // Firebase reports a verified session.
  const isVerified = Boolean(user?.emailVerified);
  const firebaseUid = user?.uid ?? null;

  useEffect(() => {
    if (!isVerified || !firebaseUid) {
      return;
    }

    const controller = new AbortController();

    api.getMe(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) {
          return;
        }

        setProfileResult({ uid: firebaseUid, profile: data });
      },
      () => {
        if (controller.signal.aborted) {
          return;
        }

        // Settle with a null profile: consumers treat "no profile" as "not an
        // admin", which is the safe direction to fail. Settling (rather than
        // staying in a loading state) keeps a failed request from hanging the
        // guard on a spinner forever.
        setProfileResult({ uid: firebaseUid, profile: null });
      },
    );

    return () => controller.abort();
  }, [isVerified, firebaseUid, profileNonce]);

  const settled = firebaseUid && profileResult?.uid === firebaseUid ? profileResult : null;
  const profile = isVerified ? (settled?.profile ?? null) : null;
  const profileLoading = isVerified && settled === null;

  const refreshProfile = useCallback(() => setProfileNonce((value) => value + 1), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      profile,
      profileLoading,
      refreshProfile,
      getIdToken: () => getAuthToken(),
    }),
    [user, loading, profile, profileLoading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
