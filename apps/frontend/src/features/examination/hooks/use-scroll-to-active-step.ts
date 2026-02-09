import { useLayoutEffect, useRef } from "react";

/**
 * Scrolls the active step div into view when the step index changes.
 *
 * Returns a ref to attach to the currently active step's container element.
 * Only scrolls when stepIndex actually changes (not on initial mount),
 * so the layout's scroll-to-top on section entry takes effect instead.
 */
export function useScrollToActiveStep(stepIndex: number) {
  const ref = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(stepIndex);

  useLayoutEffect(() => {
    if (prevStepRef.current === stepIndex) {
      return;
    }
    prevStepRef.current = stepIndex;

    // Scroll to absolute top of the main container, then scroll the step into view
    const container = document.getElementById("main-scroll-container");
    if (container) {
      container.scrollTop = 0;
    }
  }, [stepIndex]);

  return ref;
}
