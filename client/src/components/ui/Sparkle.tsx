import { cn } from "@/src/lib/utils";

type SparkleProps = {
  className?: string;
};

/**
 * The "this is AI" marker — a small four-point spark rendered with a violet
 * glow so it reads as lit/embossed rather than a flat icon. Pair with a label
 * on any AI-generated content (currently: roadmap generation).
 */
export function Sparkle({ className }: SparkleProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      className={cn("shrink-0 text-ai drop-shadow-[0_0_3px_rgb(139_92_246_/_0.65)]", className)}
      aria-hidden="true"
    >
      <path
        d="M8 0c.4 2.6 1 4.2 1.8 4.9.8.8 2.4 1.4 4.9 1.8-2.5.4-4.1 1-4.9 1.8-.8.7-1.4 2.3-1.8 4.9-.4-2.6-1-4.2-1.8-4.9-.8-.8-2.4-1.4-4.9-1.8 2.5-.4 4.1-1 4.9-1.8C7 4.2 7.6 2.6 8 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
