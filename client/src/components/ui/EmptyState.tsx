import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed text-center">
      <p className="font-display text-[0.6875rem] uppercase tracking-wider text-ink-faint">
        No signal
      </p>
      <h2 className="mt-2 text-lg font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-dim">{description}</p>
    </Card>
  );
}
