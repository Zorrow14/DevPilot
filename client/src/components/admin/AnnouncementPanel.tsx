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
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
            Create announcement
          </h2>
          <Badge tone="alert">Not wired up</Badge>
        </div>

        <p className="mt-3 text-sm text-ink-dim">
          /api/admin/announcements is read-only today — there is no create endpoint behind this
          form yet.
        </p>

        <fieldset className="mt-5 space-y-4" disabled>
          <Input placeholder="Announcement title" />
          <Input as="textarea" rows={5} placeholder="Write a short platform update" />
          <Button className="w-full" disabled>
            Save announcement
          </Button>
        </fieldset>
      </Card>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="letterpress font-bold text-ink">{announcement.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-dim">{announcement.message}</p>
              </div>
              <Badge tone="beacon">{announcement.audience}</Badge>
            </div>
            <p className="mt-4 text-sm text-ink-dim">{announcement.createdAt}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
