import { cn } from "@/src/lib/utils";

type ProgressBarProps = {
  value: number;
  tone?: "beacon" | "heading" | "nominal" | "alert";
};

// Each fill carries a matching glow so the bar reads as lit, not just colored —
// the recessed track (below) is what makes that light look like it's sitting in
// a carved channel rather than floating on the surface.
const fills = {
  beacon: "bg-beacon shadow-[0_0_6px_0_rgb(255_159_69_/_0.5)]",
  heading: "bg-heading shadow-[0_0_6px_0_rgb(70_201_176_/_0.5)]",
  nominal: "bg-nominal shadow-[0_0_6px_0_rgb(124_217_139_/_0.5)]",
  alert: "bg-alert shadow-[0_0_6px_0_rgb(232_86_74_/_0.5)]",
};

export function ProgressBar({ value, tone = "beacon" }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 overflow-hidden rounded-full bg-bezel carved"
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", fills[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
