import { cn } from "@/src/lib/utils";
import { Card } from "./Card";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "beacon" | "heading" | "nominal" | "alert";
  className?: string;
};

const accents = {
  beacon: "before:bg-beacon",
  heading: "before:bg-heading",
  nominal: "before:bg-nominal",
  alert: "before:bg-alert",
};

export function StatCard({ label, value, helper, tone = "beacon", className }: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-1",
        accents[tone],
        className,
      )}
    >
      <p className="font-display text-micro uppercase tracking-wider text-ink-dim">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-bold text-ink">{value}</p>
      {helper ? <p className="mt-2 text-sm text-ink-dim">{helper}</p> : null}
    </Card>
  );
}
