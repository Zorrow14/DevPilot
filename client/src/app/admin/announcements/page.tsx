import { AdminShell } from "@/src/components/layout/AdminShell";
import { AnnouncementPanel } from "@/src/components/admin/AnnouncementPanel";
import { mockAnnouncements } from "@/src/data/mockData";

export default function AdminAnnouncementsPage() {
  return (
    <AdminShell title="Announcements" description="Static announcement list and publishing placeholder.">
      <AnnouncementPanel announcements={mockAnnouncements} />
    </AdminShell>
  );
}
