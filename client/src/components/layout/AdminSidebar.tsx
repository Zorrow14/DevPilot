"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/src/components/ui/Badge";
import { cn } from "@/src/lib/utils";
import { adminRoutes, routes } from "@/src/constants/routes";

const adminNavItems = [
  { label: "Overview", href: adminRoutes.home },
  { label: "Users", href: adminRoutes.users },
  { label: "Projects", href: adminRoutes.projects },
  { label: "Skills", href: adminRoutes.skills },
  { label: "Roadmaps", href: adminRoutes.roadmaps },
  { label: "Feedback", href: adminRoutes.feedback },
  { label: "Announcements", href: adminRoutes.announcements },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-bezel bg-console px-5 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:py-6">
      <Link href={routes.home} className="flex items-center gap-2">
        <p className="font-display text-lg font-bold text-ink">DevPilot</p>
        <Badge tone="beacon">Admin</Badge>
      </Link>
      <p className="mt-1 font-display text-micro uppercase tracking-wider text-ink-dim">
        Platform monitoring
      </p>
      <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {adminNavItems.map((item) => {
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
    </aside>
  );
}
