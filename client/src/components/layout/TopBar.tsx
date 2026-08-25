import Link from "next/link";
import { LogoutButton } from "@/src/components/auth/LogoutButton";
import { routes } from "@/src/constants/routes";

export function TopBar() {
  return (
    <div className="mb-6 flex items-center justify-between rounded-bezel border border-bezel bg-console px-4 py-3 lg:hidden">
      <Link href={routes.home} className="font-display font-bold text-ink">
        DevPilot
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href={routes.profile}
          className="rounded-bezel border border-bezel-bright px-3 py-2 text-sm font-semibold text-ink-dim hover:text-beacon"
        >
          Profile
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
