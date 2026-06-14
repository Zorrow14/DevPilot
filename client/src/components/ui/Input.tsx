import { cn } from "@/src/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  as?: "input" | "textarea" | "select";
  children?: React.ReactNode;
};

export function Input({
  label,
  as = "input",
  type = "text",
  placeholder,
  rows = 4,
  children,
  className,
  ...props
}: InputProps) {
  const fieldClassName = cn(
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900",
    !label && "mt-0",
    className,
  );

  const field =
    as === "textarea" ? (
      <textarea
        rows={rows}
        placeholder={placeholder}
        className={fieldClassName}
        {...props}
      />
    ) : as === "select" ? (
      <select className={fieldClassName} {...props}>
        {children}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        className={fieldClassName}
        {...props}
      />
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
