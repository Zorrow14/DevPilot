import { Card } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";
import type { Announcement } from "@/src/types";

type AnnouncementPanelProps = {
  announcement: Announcement;
  className?: string;
};

export function AnnouncementPanel({ announcement, className }: AnnouncementPanelProps) {
  return (
    <Card className={cn("h-full", className)}>
      <p className="font-display text-micro uppercase tracking-wider text-beacon">Announcement</p>
      <h2 className="mt-2 text-lg font-bold text-ink">{announcement.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-dim">{announcement.message}</p>
    </Card>
  );
}
