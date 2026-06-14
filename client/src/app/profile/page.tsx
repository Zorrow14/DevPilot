import { AppShell } from "@/src/components/layout/AppShell";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import { mockUser } from "@/src/data/mockData";

export default function ProfilePage() {
  return (
    <AppShell
      title="Profile"
      description="Your static learner profile and career preferences."
    >
      <Card className="max-w-3xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            AC
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {mockUser.name}
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{mockUser.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="indigo">{mockUser.targetRole}</Badge>
              <Badge>{mockUser.role}</Badge>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Preferred Stack
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {mockUser.preferredStack.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Readiness Score
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {mockUser.readinessScore}%
              </span>
            </div>
            <ProgressBar value={mockUser.readinessScore} />
          </div>
        </div>

        <Button className="mt-8">
          Edit Profile
        </Button>
      </Card>
    </AppShell>
  );
}
