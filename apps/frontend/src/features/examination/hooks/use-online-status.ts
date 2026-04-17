import { useEffect, useState } from "react";

/**
 * Reactive mirror of `navigator.onLine`. Updates on the `online` / `offline`
 * window events. Used by the examination layout to surface an offline badge
 * while writes are paused by TanStack Query's `networkMode: "offlineFirst"`.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}
