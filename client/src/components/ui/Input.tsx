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
  // Recessed shadow reads as a well carved into the panel — the paper sheet sits
  // inside it, so the field looks like something you type into, not onto.
  const fieldClassName = cn(
    "mt-2 w-full rounded-bezel border border-paper-line bg-paper px-4 py-3 text-sm text-paper-ink carved outline-none placeholder:text-paper-ink/50 focus-visible:border-beacon",
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
      <span className="font-display text-micro uppercase tracking-wider text-ink-dim">
        {label}
      </span>
      {field}
    </label>
  );
}
