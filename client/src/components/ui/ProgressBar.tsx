import { cn } from "@/src/lib/utils";

type ProgressBarProps = {
  value: number;
  tone?: "beacon" | "heading" | "nominal" | "alert";
};

const fills = {
  beacon: "bg-beacon",
  heading: "bg-heading",
  nominal: "bg-nominal",
  alert: "bg-alert",
};

export function ProgressBar({ value, tone = "beacon" }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 overflow-hidden rounded-full bg-bezel"
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", fills[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
