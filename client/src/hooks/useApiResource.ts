"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ApiResourceResult<T> = {
  key: string;
  data: T | null;
  error: string | null;
};

/**
 * Runs an API fetcher on mount, and again whenever `key` changes or `reload` is
 * called. Replaces the identical useState/useEffect/try-catch block that was
 * copy-pasted across every data page.
 *
 * The settled result is stored tagged with the request that produced it, so
 * loading state is derived rather than stored — a result from a previous key is
 * simply not shown. That keeps every setState inside an async callback, which is
 * what React wants from an effect.
 */
export function useApiResource<T>(fetcher: (signal: AbortSignal) => Promise<T>, key = "") {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<ApiResourceResult<T> | null>(null);
  const fetcherRef = useRef(fetcher);

  const requestKey = `${key}:${nonce}`;

  // Declared before the fetch effect so it is synced first. Assigning during
  // render would be unsafe, since React can discard a render.
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const controller = new AbortController();

    fetcherRef.current(controller.signal).then(
      (data) => {
        // The token lookup resolves before fetch even starts, so cleanup can land
        // while there is nothing to cancel — check the signal rather than relying
        // on fetch to reject.
        if (controller.signal.aborted) {
          return;
        }

        setResult({ key: requestKey, data, error: null });
      },
      (error: unknown) => {
        // StrictMode double-invokes effects in dev; the discarded first pass
        // aborts and must not surface as an error.
        if (controller.signal.aborted || (error as Error | null)?.name === "AbortError") {
          return;
        }

        setResult({
          key: requestKey,
          data: null,
          error: error instanceof Error ? error.message : "Request failed.",
        });
      },
    );

    return () => controller.abort();
  }, [requestKey]);

  const settled = result?.key === requestKey ? result : null;
  const reload = useCallback(() => setNonce((value) => value + 1), []);

  return {
    data: settled?.data ?? null,
    error: settled?.error ?? null,
    isLoading: settled === null,
    reload,
  };
}
