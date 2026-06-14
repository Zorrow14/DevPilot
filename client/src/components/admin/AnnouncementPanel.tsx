import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import type { Announcement } from "@/src/types";

type AnnouncementPanelProps = {
  announcements: Announcement[];
};

export function AnnouncementPanel({ announcements }: AnnouncementPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Create Announcement
        </h2>
        <form className="mt-5 space-y-4">
          <Input placeholder="Announcement title" />
          <Input
            as="textarea"
            rows={5}
            placeholder="Write a short platform update"
          />
          <Button className="w-full">Save Announcement</Button>
        </form>
      </Card>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">
                  {announcement.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {announcement.message}
                </p>
              </div>
              <Badge tone="indigo">{announcement.audience}</Badge>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {announcement.createdAt}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
