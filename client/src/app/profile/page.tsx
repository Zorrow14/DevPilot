"use client";

import { useState } from "react";

import { AppShell } from "@/src/components/layout/AppShell";
import { ProfileForm } from "@/src/components/profile/ProfileForm";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api, type UserProfile } from "@/src/lib/api";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function ProfilePage() {
  const { data, error, isLoading } = useApiResource((signal) => api.getMe(signal));
  const [saved, setSaved] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // A completed save takes precedence over the fetched copy, so the page reflects
  // the new values without a refetch and without mirroring state into an effect.
  const profile = saved ?? data;

  return (
    <AppShell title="Profile" description="Your account details and career preferences.">
      {isLoading ? (
        <Card className="max-w-3xl">Loading profile...</Card>
      ) : error ? (
        <EmptyState title="Profile unavailable" description={error} />
      ) : profile ? (
        <Card className="max-w-3xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-bezel border border-beacon-dim bg-beacon-dim/30 font-display text-2xl font-bold text-beacon">
              {getInitials(profile.name)}
            </div>
            <div>
              <h2 className="letterpress text-2xl font-bold text-ink">{profile.name}</h2>
              <p className="mt-1 text-ink-dim">{profile.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.targetRole ? (
                  <Badge tone="heading">{profile.targetRole}</Badge>
                ) : null}
                <Badge tone="beacon">{profile.role}</Badge>
                <Badge tone={profile.status === "active" ? "nominal" : "alert"}>
                  {profile.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-bezel pt-6 sm:grid-cols-2">
            <div>
              <p className="font-display text-micro uppercase tracking-wider text-ink-dim">
                Preferred stack
              </p>
              {profile.preferredStack.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.preferredStack.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-ink-faint">Not set yet.</p>
              )}
            </div>
            <div>
              <p className="font-display text-micro uppercase tracking-wider text-ink-dim">
                Member since
              </p>
              <p className="mt-2 font-display text-sm text-ink">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {isEditing ? (
            <ProfileForm
              profile={profile}
              onSaved={(next) => {
                setSaved(next);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <Button className="mt-8" onClick={() => setIsEditing(true)}>
              Edit profile
            </Button>
          )}
        </Card>
      ) : null}
    </AppShell>
  );
}
