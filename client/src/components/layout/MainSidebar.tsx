"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/src/components/auth/LogoutButton";
import { cn } from "@/src/lib/utils";
import { routes } from "@/src/constants/routes";

const navItems = [
  { label: "Dashboard", href: routes.dashboard },
  { label: "Skills", href: routes.skills },
  { label: "Projects", href: routes.projects },
  { label: "Roadmap", href: routes.roadmap },
  { label: "Profile", href: routes.profile },
];

export function MainSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-bezel bg-console px-5 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:py-6">
      <Link href={routes.home} className="block">
        <p className="font-display text-lg font-bold text-ink">DevPilot</p>
        <p className="mt-1 font-display text-micro uppercase tracking-wider text-ink-dim">
          Growth workspace
        </p>
      </Link>
      <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-bezel border-l-2 px-3 py-2 text-sm font-medium transition",
                active
                  ? "border-beacon bg-console-raised text-beacon"
                  : "border-transparent text-ink-dim hover:bg-console-raised hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 hidden lg:block">
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}
