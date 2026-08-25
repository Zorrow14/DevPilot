import { cn } from "@/src/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-bezel border border-bezel bg-console p-5 shadow-raised sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
