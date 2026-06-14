import { Card } from "./Card";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {helper ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
      ) : null}
    </Card>
  );
}
