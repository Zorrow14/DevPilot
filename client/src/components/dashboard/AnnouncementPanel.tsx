import { Card } from "@/src/components/ui/Card";
import type { Announcement } from "@/src/types";

type AnnouncementPanelProps = {
  announcement: Announcement;
};

export function AnnouncementPanel({ announcement }: AnnouncementPanelProps) {
  return (
    <Card>
      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
        Announcement
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        {announcement.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {announcement.message}
      </p>
    </Card>
  );
}
