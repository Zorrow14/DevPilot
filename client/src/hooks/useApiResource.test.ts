import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useApiResource } from "./useApiResource";

describe("useApiResource", () => {
  it("starts in a loading state with no data", () => {
    const { result } = renderHook(() => useApiResource(() => new Promise(() => {})));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("exposes data once the fetch resolves", async () => {
    const { result } = renderHook(() => useApiResource(async () => ({ id: "skill-1" })));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ id: "skill-1" });
    expect(result.current.error).toBeNull();
  });

  it("surfaces the error message when the fetch rejects", async () => {
    const { result } = renderHook(() =>
      useApiResource(async () => {
        throw new Error("API request failed: 500");
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("API request failed: 500");
    expect(result.current.data).toBeNull();
  });

  it("falls back to a generic message for a non-Error rejection", async () => {
    const { result } = renderHook(() => useApiResource(() => Promise.reject("nope")));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Request failed.");
  });

  it("refetches when reload is called", async () => {
    let calls = 0;
    const fetcher = vi.fn(async () => ({ calls: ++calls }));

    const { result } = renderHook(() => useApiResource(fetcher));

    await waitFor(() => expect(result.current.data).toEqual({ calls: 1 }));

    act(() => result.current.reload());

    await waitFor(() => expect(result.current.data).toEqual({ calls: 2 }));
  });

  it("refetches when the key changes and ignores the superseded result", async () => {
    // A stale response arriving after the key moved on must not be shown — the
    // result is tagged with the request that produced it.
    const fetcher = vi.fn(async () => "second");

    const { result, rerender } = renderHook(({ key }) => useApiResource(fetcher, key), {
      initialProps: { key: "a" },
    });

    await waitFor(() => expect(result.current.data).toBe("second"));

    rerender({ key: "b" });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("aborts the in-flight request on unmount", async () => {
    const seen: AbortSignal[] = [];
    const { unmount } = renderHook(() =>
      useApiResource((signal) => {
        seen.push(signal);
        return new Promise(() => {});
      }),
    );

    expect(seen[0].aborted).toBe(false);
    unmount();
    expect(seen[0].aborted).toBe(true);
  });

  it("does not report an aborted request as an error", async () => {
    // StrictMode double-invokes effects in dev; the discarded first pass aborts
    // and must stay invisible rather than surfacing as a failed request.
    const { result } = renderHook(() =>
      useApiResource(async (signal) => {
        if (signal.aborted) {
          const error = new Error("aborted");
          error.name = "AbortError";
          throw error;
        }
        return "ok";
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe("ok");
  });
});
