import { cn } from "@/src/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * "raised" (default) molds the card out of the panel — the right choice for
   * containers and interactive tiles. "flat" drops the shadow for cards that
   * exist only to wrap dense data (tables, long lists) — depth there reads as
   * noise, not structure. See the design doc's "dense data stays flat" rule.
   */
  elevation?: "raised" | "flat";
};

export function Card({ children, className, elevation = "raised" }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-bezel border border-bezel bg-console p-5 sm:p-6",
        elevation === "raised" && "molded",
        className,
      )}
    >
      {children}
    </section>
  );
}
