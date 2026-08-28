/**
 * Human-facing date formatting.
 *
 * The API sends date-only strings ("2026-08-28") or "" for unset, matching how
 * the server's formatX helpers serialize DateTime columns. Turning those into
 * readable phrases is a display concern, so it lives here rather than on the
 * server — the same value reads as "today" or "3 days ago" depending on when
 * the page is opened, which is not something a cached API response can know.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parses a date-only string as local midnight, avoiding a UTC off-by-one. */
function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Renders a date-only string as a relative phrase, falling back to the date
 * itself once it is far enough in the past to be worth stating precisely.
 * Returns null for empty/unparseable input so callers can choose their own
 * empty-state copy rather than being handed the string "null".
 */
export function formatRelativeDate(value: string | null | undefined, now = new Date()): string | null {
  if (!value) {
    return null;
  }

  const date = parseDateOnly(value);

  if (!date) {
    return null;
  }

  const days = Math.round((startOfLocalDay(now).getTime() - date.getTime()) / MS_PER_DAY);

  if (days < 0) {
    return date.toLocaleDateString();
  }

  if (days === 0) {
    return "today";
  }

  if (days === 1) {
    return "yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  if (days < 14) {
    return "last week";
  }

  if (days < 60) {
    return `${Math.floor(days / 7)} weeks ago`;
  }

  return date.toLocaleDateString();
}
