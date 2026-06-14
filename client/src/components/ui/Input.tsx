import { cn } from "@/src/lib/utils";

type InputProps = {
  label?: string;
  as?: "input" | "textarea" | "select";
  type?: string;
  placeholder?: string;
  rows?: number;
  children?: React.ReactNode;
  className?: string;
};

export function Input({
  label,
  as = "input",
  type = "text",
  placeholder,
  rows = 4,
  children,
  className,
}: InputProps) {
  const fieldClassName = cn(
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900",
    !label && "mt-0",
    className,
  );

  const field =
    as === "textarea" ? (
      <textarea rows={rows} placeholder={placeholder} className={fieldClassName} />
    ) : as === "select" ? (
      <select className={fieldClassName}>{children}</select>
    ) : (
      <input type={type} placeholder={placeholder} className={fieldClassName} />
    );

  if (!label) {
    return field;
  }

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {field}
    </label>
  );
}
