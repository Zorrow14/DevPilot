import Link from "next/link";
import { LogoutButton } from "@/src/components/auth/LogoutButton";
import { routes } from "@/src/constants/routes";

export function TopBar() {
  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 lg:hidden">
      <Link href={routes.home} className="font-bold text-slate-900 dark:text-slate-100">
        DevPilot
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href={routes.profile}
          className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
        >
          Profile
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
