/**
 * Shared animated progress bar with transition phase support.
 *
 * Handles the progress fill animation, success state (green bar + pulse),
 * and phase transition timing. Consumers provide their own status text.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export type TransitionPhase =
  | "active" // Normal interaction
  | "completing" // Progress bar filling to 100%
  | "success" // Green bar + checkmark animation
  | "exiting"; // Transitioning to next questionnaire

const TIMING = {
  fillProgress: 280,
  successPause: 560,
};

type ProgressBarProps = {
  /** Progress percentage (0–100). Ignored during transition (forced to 100%). */
  progress: number;
  transitionPhase?: TransitionPhase;
  onTransitionPhaseComplete?: (phase: TransitionPhase) => void;
};

export function ProgressBar({
  progress,
  transitionPhase = "active",
  onTransitionPhaseComplete,
}: ProgressBarProps) {
  const targetPercentage = transitionPhase === "active" ? progress : 100;
  const isSuccess = transitionPhase === "success" || transitionPhase === "exiting";
  const isAnimating = transitionPhase === "completing" || transitionPhase === "success";

  // Trigger phase transitions based on timing
  useEffect(() => {
    if (!onTransitionPhaseComplete) return;

    if (transitionPhase === "completing") {
      const timer = setTimeout(() => {
        onTransitionPhaseComplete("completing");
      }, TIMING.fillProgress);
      return () => clearTimeout(timer);
    }

    if (transitionPhase === "success") {
      const timer = setTimeout(() => {
        onTransitionPhaseComplete("success");
      }, TIMING.successPause);
      return () => clearTimeout(timer);
    }
  }, [transitionPhase, onTransitionPhaseComplete]);

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
      <motion.div
        className={`h-full rounded-full ${isSuccess ? "bg-green-500" : "bg-primary"}`}
        initial={{ width: `${progress}%` }}
        animate={{ width: `${targetPercentage}%` }}
        transition={{
          duration: isAnimating ? TIMING.fillProgress / 1000 : 0.2,
          ease: "easeOut",
        }}
      />

      {/* Success pulse overlay */}
      <AnimatePresence>
        {transitionPhase === "success" && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-400"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
