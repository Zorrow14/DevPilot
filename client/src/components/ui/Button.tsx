import Link from "next/link";
import { cn } from "@/src/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "bg-beacon text-panel molded hover:brightness-110 active:translate-y-px active:shadow-[inset_0_1px_2px_0_rgb(0_0_0_/_0.35)] active:brightness-95",
  secondary:
    "border border-bezel-bright bg-console text-ink molded hover:border-beacon hover:text-beacon active:translate-y-px active:shadow-[inset_0_1px_2px_0_rgb(0_0_0_/_0.45)]",
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
  // Buttons are the one interaction where physical depression matters most — a
  // real surface catches light, then visibly sinks under press. Kept under
  // 150ms both ways so depth never reads as input lag.
  const classes = cn(
    "inline-flex items-center justify-center rounded-bezel px-4 py-2.5 text-sm font-semibold transition-all duration-100 ease-out disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0",
    variants[variant],
    className,
  );

  if (href) {
    // A disabled link is not a thing in HTML, and silently dropping `disabled`
    // let a busy action stay clickable. Render the same surface as a real
    // disabled button instead, with the link removed from the tab order and
    // hidden from assistive tech.
    if (disabled) {
      return (
        <span className={cn(classes, "cursor-not-allowed opacity-40 shadow-none")} aria-disabled>
          {children}
        </span>
      );
    }

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
