/**
 * Bootstrap admin list.
 *
 * Firebase is the identity provider, so a user's Postgres row does not exist
 * until their first authenticated request. That leaves no row for a seed script
 * to promote and no way to reach `PATCH /api/admin/users/:id/role`, which is
 * itself behind requireAdmin — on a fresh database nobody could ever become an
 * admin. This env list is the way in.
 *
 * Read from the environment on every call rather than cached at import time, so
 * a host that injects env vars after module load still sees the value and tests
 * can change it without a module reset.
 */

/** Parses ADMIN_EMAILS: comma-separated, lowercased, blanks dropped. */
export function getBootstrapAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Whether this address should hold ADMIN.
 *
 * Compared case-insensitively: Firebase echoes back whatever casing the user
 * typed at signup, and an admin locked out by a capital letter would have no
 * second way in.
 */
export function isBootstrapAdmin(email: string): boolean {
  if (!email) {
    return false;
  }

  return getBootstrapAdminEmails().includes(email.trim().toLowerCase());
}
