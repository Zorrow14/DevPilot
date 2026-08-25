import { cn } from "@/src/lib/utils";

type ReadinessGaugeProps = {
  value: number;
  label?: string;
  size?: number;
  className?: string;
};

const TICKS = [
  { outer: [100, 10], inner: [100, 20] },
  { outer: [55, 22.06], inner: [60, 30.72] },
  { outer: [145, 22.06], inner: [140, 30.72] },
  { outer: [22.06, 55], inner: [30.72, 60] },
  { outer: [177.94, 55], inner: [169.28, 60] },
];

export function ReadinessGauge({ value, label = "Readiness", size = 160, className }: ReadinessGaugeProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const horizonY = 20 + 160 * (clamped / 100);

  return (
    <div className={cn("inline-flex flex-col items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        role="img"
        aria-label={`${label}: ${clamped}%`}
      >
        <defs>
          <clipPath id="gauge-clip">
            <circle cx="100" cy="100" r="86" />
          </clipPath>
          <linearGradient id="gauge-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-heading-dim)" />
            <stop offset="100%" stopColor="var(--color-heading)" />
          </linearGradient>
          <linearGradient id="gauge-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-beacon)" />
            <stop offset="100%" stopColor="var(--color-beacon-dim)" />
          </linearGradient>
        </defs>

        <g clipPath="url(#gauge-clip)">
          <rect
            x="10"
            y="10"
            width="180"
            height={Math.max(horizonY - 10, 0)}
            fill="url(#gauge-sky)"
            style={{ transition: "height 700ms ease" }}
          />
          <rect
            x="10"
            y={horizonY}
            width="180"
            height={Math.max(190 - horizonY, 0)}
            fill="url(#gauge-ground)"
            style={{ transition: "y 700ms ease, height 700ms ease" }}
          />
          <line
            x1="10"
            y1={horizonY}
            x2="190"
            y2={horizonY}
            stroke="var(--color-ink)"
            strokeWidth="1.5"
            style={{ transition: "y1 700ms ease, y2 700ms ease" }}
          />
        </g>

        {TICKS.map((tick, i) => (
          <line
            key={i}
            x1={tick.outer[0]}
            y1={tick.outer[1]}
            x2={tick.inner[0]}
            y2={tick.inner[1]}
            stroke="var(--color-ink-dim)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

        <circle cx="100" cy="100" r="86" fill="none" stroke="var(--color-bezel)" strokeWidth="5" />
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="var(--color-bezel-bright)"
          strokeWidth="1"
        />

        <g stroke="var(--color-beacon)" strokeWidth="3.5" strokeLinecap="round">
          <line x1="66" y1="100" x2="86" y2="100" />
          <line x1="114" y1="100" x2="134" y2="100" />
          <circle cx="100" cy="100" r="3" fill="var(--color-beacon)" stroke="none" />
        </g>
      </svg>
      <div className="text-center">
        <p className="font-display text-2xl font-bold text-ink">{clamped}%</p>
        <p className="font-display text-micro uppercase tracking-wider text-ink-dim">
          {label}
        </p>
      </div>
    </div>
  );
}
