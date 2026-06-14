import { Badge } from "@/src/components/ui/Badge";
import { Card } from "@/src/components/ui/Card";
import { ProgressBar } from "@/src/components/ui/ProgressBar";

type AdminAnalyticsCardProps = {
  title: string;
  subtitle: string;
  value: number;
  badge?: string;
};

export function AdminAnalyticsCard({
  title,
  subtitle,
  value,
  badge,
}: AdminAnalyticsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
        {badge ? <Badge tone="indigo">{badge}</Badge> : null}
      </div>
      <div className="mt-5">
        <ProgressBar value={value} />
      </div>
    </Card>
  );
}
