import { cn } from "@/src/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "beacon" | "heading" | "nominal" | "alert";
};

const tones = {
  neutral: "border-bezel-bright bg-console-raised text-ink-dim",
  beacon: "border-beacon-dim bg-beacon-dim/30 text-beacon",
  heading: "border-heading-dim bg-heading-dim/30 text-heading",
  nominal: "border-nominal-dim bg-nominal-dim/30 text-nominal",
  alert: "border-alert-dim bg-alert-dim/30 text-alert",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-bezel border px-2.5 py-1 font-display text-micro font-medium uppercase tracking-wider",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
