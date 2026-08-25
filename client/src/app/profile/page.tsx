import { AppShell } from "@/src/components/layout/AppShell";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { ReadinessGauge } from "@/src/components/ui/ReadinessGauge";
import { mockUser } from "@/src/data/mockData";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" description="Your static learner profile and career preferences.">
      <Card className="max-w-3xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-bezel border border-beacon-dim bg-beacon-dim/30 font-display text-2xl font-bold text-beacon">
              AC
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">{mockUser.name}</h2>
              <p className="mt-1 text-ink-dim">{mockUser.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="beacon">{mockUser.targetRole}</Badge>
                <Badge>{mockUser.role}</Badge>
              </div>
            </div>
          </div>
          <ReadinessGauge value={mockUser.readinessScore} size={104} />
        </div>

        <div className="mt-8 border-t border-bezel pt-6">
          <p className="font-display text-[0.6875rem] uppercase tracking-wider text-ink-dim">
            Preferred stack
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mockUser.preferredStack.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </div>

        <Button className="mt-8">Edit profile</Button>
      </Card>
    </AppShell>
  );
}
