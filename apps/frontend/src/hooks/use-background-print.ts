/* eslint-disable no-undef */
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for background printing via a hidden iframe.
 *
 * Creates an off-screen iframe pointing to a print route URL.
 * The print route auto-triggers `window.print()` and signals completion
 * via `postMessage({ type: 'print-done' })`.
 */
export function useBackgroundPrint() {
  const [isPrinting, setIsPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const cleanup = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.remove();
      iframeRef.current = null;
    }
    setIsPrinting(false);
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "print-done") {
        cleanup();
      }
    }

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      cleanup();
    };
  }, [cleanup]);

  const print = useCallback(
    (url: string) => {
      // Prevent double-triggering
      if (isPrinting) return;

      setIsPrinting(true);

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      iframe.src = url;

      iframeRef.current = iframe;
      document.body.appendChild(iframe);
    },
    [isPrinting]
  );

  return { print, isPrinting };
}
