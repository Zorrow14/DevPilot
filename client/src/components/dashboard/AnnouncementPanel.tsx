import { Card } from "@/src/components/ui/Card";
import type { Announcement } from "@/src/types";

type AnnouncementPanelProps = {
  announcement: Announcement;
};

export function AnnouncementPanel({ announcement }: AnnouncementPanelProps) {
  return (
    <Card>
      <p className="font-display text-[0.6875rem] uppercase tracking-wider text-beacon">
        Announcement
      </p>
      <h2 className="mt-2 text-lg font-bold text-ink">{announcement.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-dim">{announcement.message}</p>
    </Card>
  );
}
