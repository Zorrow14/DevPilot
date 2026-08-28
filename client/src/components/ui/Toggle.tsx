import { cn } from "@/src/lib/utils";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** "nominal" (mint) for growth/progress toggles, "ai" (violet) for AI-driven ones. */
  tone?: "nominal" | "ai";
  disabled?: boolean;
  className?: string;
};

const thumbTones = {
  nominal: "peer-checked:translate-x-4 peer-checked:bg-nominal peer-checked:shadow-[0_0_6px_0_rgb(124_217_139_/_0.6)]",
  ai: "peer-checked:translate-x-4 peer-checked:bg-ai peer-checked:shadow-[0_0_6px_0_rgb(139_92_246_/_0.6)]",
};

/**
 * A physical switch: recessed track, raised lit thumb that throws right when on.
 * The native checkbox stays in the DOM (visually hidden) so keyboard, screen
 * reader, and focus-visible behavior all come for free — the track/thumb are
 * just its `peer`-driven skin.
 */
export function Toggle({ checked, onChange, label, tone = "nominal", disabled, className }: ToggleProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-3", disabled && "cursor-not-allowed opacity-40", className)}>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-bezel carved">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "ml-1 h-4 w-4 rounded-full bg-console-raised molded transition-transform duration-100 ease-out",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-beacon",
            thumbTones[tone],
          )}
        />
      </span>
      <span className="text-sm text-ink">{label}</span>
    </label>
  );
}
