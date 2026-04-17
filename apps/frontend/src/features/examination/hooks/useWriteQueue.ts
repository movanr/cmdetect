import { useCallback, useRef, useState } from "react";

/**
 * Serialized write primitive.
 *
 * All `enqueue(fn)` calls execute strictly in order: each `fn` runs only after
 * the prior one has settled (success or failure). This lets persistence-layer
 * code compose multiple concurrent triggers — debounced autosave, explicit
 * saveSection, completeExamination, Behandler changes — without racing.
 *
 * A failure in one operation surfaces via `error` but does not break the chain:
 * subsequent operations still run. This matches real persistence UX — one
 * offline autosave shouldn't prevent a later save from trying.
 *
 * `drain()` returns the tail promise for awaiting a fully-settled queue.
 * Used by the navigation blocker to flush pending writes before leaving.
 */
export interface WriteQueue {
  enqueue: <T>(fn: () => Promise<T>) => Promise<T>;
  drain: () => Promise<void>;
  error: Error | null;
  clearError: () => void;
}

export function useWriteQueue(): WriteQueue {
  const tailRef = useRef<Promise<unknown>>(Promise.resolve());
  const [error, setError] = useState<Error | null>(null);

  const enqueue = useCallback(<T,>(fn: () => Promise<T>): Promise<T> => {
    const next = tailRef.current.then(() => fn());
    tailRef.current = next.catch(() => {});
    next.catch((e: unknown) => {
      setError(e instanceof Error ? e : new Error(String(e)));
    });
    return next;
  }, []);

  const drain = useCallback(async () => {
    await tailRef.current;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { enqueue, drain, error, clearError };
}
