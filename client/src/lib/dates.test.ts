import { describe, expect, it } from "vitest";

import { formatRelativeDate } from "./dates";

const NOW = new Date(2026, 7, 28); // 2026-08-28, local

describe("formatRelativeDate", () => {
  it.each([null, undefined, "", "   "])("returns null for empty input: %s", (value) => {
    expect(formatRelativeDate(value, NOW)).toBeNull();
  });

  it("returns null for an unparseable value rather than 'Invalid Date'", () => {
    expect(formatRelativeDate("not-a-date", NOW)).toBeNull();
  });

  it.each([
    ["2026-08-28", "today"],
    ["2026-08-27", "yesterday"],
    ["2026-08-25", "3 days ago"],
    ["2026-08-20", "last week"],
    ["2026-08-07", "3 weeks ago"],
  ])("renders %s as %s", (value, expected) => {
    expect(formatRelativeDate(value, NOW)).toBe(expected);
  });

  it("falls back to an absolute date once the gap is large", () => {
    // Beyond ~2 months, "9 weeks ago" is less useful than the date itself.
    const result = formatRelativeDate("2026-01-15", NOW);
    expect(result).not.toBeNull();
    expect(result).not.toMatch(/ago|today|yesterday|week/);
  });

  it("does not shift the day across timezones", () => {
    // Parsing "2026-08-28" as UTC midnight renders as the 27th anywhere west of
    // Greenwich, so the value must be read as local midnight.
    expect(formatRelativeDate("2026-08-28", NOW)).toBe("today");
  });

  it("shows a future date absolutely rather than as negative days", () => {
    const result = formatRelativeDate("2026-09-05", NOW);
    expect(result).not.toMatch(/-\d/);
    expect(result).not.toBe("today");
  });

  it("ignores a time component if one is present", () => {
    expect(formatRelativeDate("2026-08-27T13:45:00.000Z", NOW)).toBe("yesterday");
  });
});
