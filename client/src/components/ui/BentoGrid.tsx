import { cn } from "@/src/lib/utils";

type BentoGridProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Twelve-column bento container. Cells claim width with `lg:col-span-*` and
 * height with `lg:row-span-*`; below the lg breakpoint every cell stacks full
 * width, so children only need to declare their large-screen span.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-12", className)}>{children}</div>
  );
}
