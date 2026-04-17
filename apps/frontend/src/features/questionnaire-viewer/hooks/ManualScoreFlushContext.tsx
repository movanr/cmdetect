/**
 * Aggregates pending manual-score auto-saves across all mounted Axis 2 panels.
 *
 * Each panel's `useManualScoreAutoSave` registers with this context; the
 * anamnesis-review route uses the aggregated view to block SPA navigation until
 * debounced saves have flushed, and to trigger the native browser warning on
 * reload/close while changes are still in flight.
 *
 * Without this, a user who types a score and immediately reloads the page loses
 * the write — the debounce timer is still pending and the browser kills the
 * eventual fetch() on unload.
 */

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";

interface Registration {
  hasPending: () => boolean;
  flush: () => Promise<void>;
}

interface ManualScoreFlushController {
  register: (key: string, entry: Registration) => () => void;
  hasAnyPending: () => boolean;
  flushAll: () => Promise<void>;
}

const ManualScoreFlushContext = createContext<ManualScoreFlushController | null>(null);

export function ManualScoreFlushProvider({ children }: { children: ReactNode }) {
  const registrationsRef = useRef(new Map<string, Registration>());

  const register = useCallback((key: string, entry: Registration) => {
    registrationsRef.current.set(key, entry);
    return () => {
      registrationsRef.current.delete(key);
    };
  }, []);

  const hasAnyPending = useCallback(() => {
    for (const entry of registrationsRef.current.values()) {
      if (entry.hasPending()) return true;
    }
    return false;
  }, []);

  const flushAll = useCallback(async () => {
    const pending: Array<Promise<void>> = [];
    for (const entry of registrationsRef.current.values()) {
      if (entry.hasPending()) pending.push(entry.flush());
    }
    await Promise.all(pending);
  }, []);

  const value = useMemo(
    () => ({ register, hasAnyPending, flushAll }),
    [register, hasAnyPending, flushAll]
  );

  return (
    <ManualScoreFlushContext.Provider value={value}>{children}</ManualScoreFlushContext.Provider>
  );
}

/** Returns the flush controller, or null when no provider is mounted. */
export function useManualScoreFlushController(): ManualScoreFlushController | null {
  return useContext(ManualScoreFlushContext);
}
