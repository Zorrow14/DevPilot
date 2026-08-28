"use client";

import { AdminShell } from "@/src/components/layout/AdminShell";
import { AnnouncementPanel } from "@/src/components/admin/AnnouncementPanel";
import { Card } from "@/src/components/ui/Card";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { useApiResource } from "@/src/hooks/useApiResource";
import { api } from "@/src/lib/api";

export default function AdminAnnouncementsPage() {
  const { data, error, isLoading, reload } = useApiResource((signal) =>
    api.getAdminAnnouncements(signal),
  );

  return (
    <AdminShell title="Announcements" description="Published announcements and publishing form.">
      {isLoading ? (
        <Card>Loading announcements...</Card>
      ) : error ? (
        <EmptyState title="Announcements unavailable" description={error} />
      ) : (
        <AnnouncementPanel announcements={data ?? []} onChanged={reload} />
      )}
    </AdminShell>
  );
}
