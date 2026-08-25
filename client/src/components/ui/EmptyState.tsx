import { cn } from "@/src/lib/utils";
import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed text-center", className)}>
      <p className="font-display text-micro uppercase tracking-wider text-ink-faint">No signal</p>
      <h2 className="mt-2 text-lg font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-dim">{description}</p>
    </Card>
  );
}
