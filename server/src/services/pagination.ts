/**
 * Paging for the admin listings.
 *
 * These endpoints read across every user, so without a bound the response grows
 * with the platform: one slow query, one large JSON serialisation, and one
 * render of thousands of rows. The cap matters more than the paging — MAX_PAGE_SIZE
 * is what stops `?pageSize=999999` from putting the unbounded query back.
 */

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  pagination: PageMeta;
};

export type PageRequest = {
  page?: number;
  pageSize?: number;
};

/** Turns a validated page request into Prisma's skip/take. */
export function resolvePaging({ page, pageSize }: PageRequest = {}) {
  // Clamped as well as validated: the validator rejects a bad value on the way
  // in, but services are also called directly (getOverview), and a negative
  // skip is a Prisma error rather than an empty page.
  const safePage = Math.max(1, Math.floor(page ?? 1));
  const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)));

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
}

/** Wraps a page of rows with the metadata the client needs to draw controls. */
export function paginated<T>(
  data: T[],
  total: number,
  { page, pageSize }: { page: number; pageSize: number },
): Paginated<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      // An empty table is one empty page, not zero pages — a "Page 1 of 0"
      // reads as broken.
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
