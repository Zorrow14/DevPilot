/**
 * Shared Recharts styling.
 *
 * Charts sit inside molded cards, so the depth belongs to the container and the
 * data stays flat — no drop shadows, no gradients on the series themselves.
 * Every colour is a design token read through var(), never a hex literal: the
 * Tailwind stock palette is deleted in globals.css, and a raw colour here would
 * be the one thing on the page that ignores the theme.
 */

export const chartColors = {
  ink: "var(--color-ink)",
  inkDim: "var(--color-ink-dim)",
  inkFaint: "var(--color-ink-faint)",
  grid: "var(--color-bezel)",
  surface: "var(--color-console-raised)",
  border: "var(--color-bezel-bright)",
  beacon: "var(--color-beacon)",
  heading: "var(--color-heading)",
  nominal: "var(--color-nominal)",
  alert: "var(--color-alert)",
  ai: "var(--color-ai)",
} as const;

/**
 * Accents in the order series should claim them. Progress reads mint→green,
 * with amber for attention — matching how the badges and progress bars already
 * signal the same states elsewhere.
 */
export const seriesColors = [
  chartColors.heading,
  chartColors.nominal,
  chartColors.beacon,
  chartColors.alert,
  chartColors.ai,
] as const;

/** Maps a status label to the tone the rest of the UI already uses for it. */
export const statusColors: Record<string, string> = {
  Planning: chartColors.inkFaint,
  "In progress": chartColors.heading,
  Completed: chartColors.nominal,
  "To do": chartColors.inkFaint,
  Done: chartColors.nominal,
};

export const axisProps = {
  stroke: chartColors.inkFaint,
  tick: { fill: chartColors.inkDim, fontSize: 11 },
  tickLine: false,
} as const;

/**
 * The tooltip is a raised chip against the card's own surface, so it reads as
 * something floating above the plot rather than drawn into it.
 */
export const tooltipProps = {
  contentStyle: {
    background: chartColors.surface,
    border: `1px solid ${chartColors.border}`,
    borderRadius: 4,
    fontSize: 12,
    color: chartColors.ink,
  },
  labelStyle: { color: chartColors.ink, fontWeight: 600 },
  itemStyle: { color: chartColors.inkDim },
  cursor: { fill: "rgb(255 255 255 / 0.04)" },
} as const;
