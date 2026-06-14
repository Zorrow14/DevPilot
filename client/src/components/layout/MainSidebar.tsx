import Link from "next/link";
import { routes } from "@/src/constants/routes";

const navItems = [
  { label: "Dashboard", href: routes.dashboard },
  { label: "Skills", href: routes.skills },
  { label: "Projects", href: routes.projects },
  { label: "Roadmap", href: routes.roadmap },
  { label: "Profile", href: routes.profile },
];

export function MainSidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:py-6">
      <Link href={routes.home} className="block">
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
          DevPilot
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Growth workspace
        </p>
      </Link>
      <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {navItems.map((item) => (
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
