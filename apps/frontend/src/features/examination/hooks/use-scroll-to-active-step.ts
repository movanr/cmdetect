import { useLayoutEffect, useRef } from "react";

/**
 * Scrolls the active step div into view when the step index changes.
 *
 * Returns a ref to attach to the currently active step's container element.
 * Skips the initial mount to avoid conflicting with the layout's scroll-to-top
 * on section entry.
 */
export function useScrollToActiveStep(stepIndex: number) {
  const ref = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useLayoutEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    ref.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [stepIndex]);

  return ref;
}
