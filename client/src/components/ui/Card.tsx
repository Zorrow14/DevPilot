import { cn } from "@/src/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-bezel border border-bezel bg-console p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
