type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-bezel pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink">
          {title}
        </h2>
        {description ? <p className="mt-1.5 text-sm text-ink-dim">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
