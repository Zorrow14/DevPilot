import { describe, expect, it } from "vitest";

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, paginated, resolvePaging } from "./pagination";

describe("resolvePaging", () => {
  it("defaults to the first page", () => {
    expect(resolvePaging()).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      skip: 0,
      take: DEFAULT_PAGE_SIZE,
    });
  });

  it("turns a page number into a skip", () => {
    expect(resolvePaging({ page: 3, pageSize: 10 })).toMatchObject({ skip: 20, take: 10 });
  });

  // The cap is the reason this module exists: without it, ?pageSize=999999
  // restores exactly the unbounded query the paging was added to remove.
  it("caps an oversized page size rather than honouring it", () => {
    expect(resolvePaging({ pageSize: 999_999 }).take).toBe(MAX_PAGE_SIZE);
  });

  it("clamps a page below one, which would otherwise be a negative skip", () => {
    expect(resolvePaging({ page: 0 })).toMatchObject({ page: 1, skip: 0 });
    expect(resolvePaging({ page: -5 })).toMatchObject({ page: 1, skip: 0 });
  });

  it("clamps a page size below one", () => {
    expect(resolvePaging({ pageSize: 0 }).take).toBe(1);
  });

  it("floors a fractional page rather than passing it to Prisma", () => {
    expect(resolvePaging({ page: 2.7, pageSize: 10 })).toMatchObject({ page: 2, skip: 10 });
  });
});

describe("paginated", () => {
  it("reports the totals a client needs to draw controls", () => {
    expect(paginated([1, 2], 57, { page: 2, pageSize: 25 }).pagination).toEqual({
      page: 2,
      pageSize: 25,
      total: 57,
      totalPages: 3,
    });
  });

  it("rounds a partial last page up", () => {
    expect(paginated([], 26, { page: 1, pageSize: 25 }).pagination.totalPages).toBe(2);
  });

  it("calls an empty table one page, not zero", () => {
    // "Page 1 of 0" reads as a bug to whoever is looking at it.
    expect(paginated([], 0, { page: 1, pageSize: 25 }).pagination.totalPages).toBe(1);
  });

  it("passes the rows through untouched", () => {
    expect(paginated(["a", "b"], 2, { page: 1, pageSize: 25 }).data).toEqual(["a", "b"]);
  });
});
