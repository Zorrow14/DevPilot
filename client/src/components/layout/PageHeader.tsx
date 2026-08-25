type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-bezel pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="border-l-2 border-beacon pl-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-dim">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
