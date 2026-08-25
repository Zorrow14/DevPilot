import Link from "next/link";
import { cn } from "@/src/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-beacon text-panel hover:brightness-110 active:brightness-95",
  secondary:
    "border border-bezel-bright bg-console text-ink hover:border-beacon hover:text-beacon",
  ghost: "text-ink-dim hover:bg-console hover:text-ink",
};

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-bezel px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
