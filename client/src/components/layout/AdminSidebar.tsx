import Link from "next/link";
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
  return (
    <aside className="border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:py-6">
      <Link href={routes.home}>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
          DevPilot Admin
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Platform monitoring
        </p>
      </Link>
      <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
