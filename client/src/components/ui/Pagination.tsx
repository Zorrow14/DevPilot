import { Button } from "@/src/components/ui/Button";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Plural noun for the counted rows, e.g. "users". */
  label: string;
};

/**
 * Page controls for the admin tables.
 *
 * Deliberately prev/next rather than numbered pages: the admin listings are
 * scanned and searched, not navigated to a remembered page 7, and numbered
 * controls would need their own truncation rules to survive a large total.
 */
export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  label,
}: PaginationProps) {
  // One page of results needs no controls, but the count is still worth saying.
  const showControls = totalPages > 1;

  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  // The last page is usually partial, so this counts the rows actually shown
  // rather than assuming a full page.
  const last = Math.min(page * pageSize, total);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-ink-dim" aria-live="polite">
        {total === 0 ? `No ${label}` : `Showing ${first}–${last} of ${total} ${label}`}
      </p>

      {showControls ? (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="text-sm text-ink-dim tabular-nums">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
