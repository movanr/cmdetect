/**
 * Progress indicator for questionnaires
 * Shows "Question X of Y" with animated progress bar
 * Supports transition animations when completing questionnaire
 */

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect } from "react";

export type TransitionPhase =
  | "active" // Normal questionnaire interaction
  | "completing" // Progress bar filling to 100%
  | "success" // Green bar + checkmark animation
  | "exiting"; // Transitioning to next questionnaire

type ProgressHeaderProps = {
  current: number;
  total: number;
  transitionPhase?: TransitionPhase;
  onTransitionPhaseComplete?: (phase: TransitionPhase) => void;
};

// Animation timing (ms)
const TIMING = {
  fillProgress: 280,
  successPause: 560,
};

export function ProgressHeader({
  current,
  total,
  transitionPhase = "active",
  onTransitionPhaseComplete,
}: ProgressHeaderProps) {
  // Calculate progress percentage
  // During 'active': show progress based on current question
  // During 'completing'/'success'/'exiting': show 100%
  const basePercentage = Math.round(((current - 1) / total) * 100);
  const targetPercentage = transitionPhase === "active" ? basePercentage : 100;

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

  const isSuccess = transitionPhase === "success" || transitionPhase === "exiting";
  const isAnimating = transitionPhase === "completing" || transitionPhase === "success";

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
        <motion.div
          className={`h-full rounded-full ${isSuccess ? "bg-green-500" : "bg-primary"}`}
          initial={{ width: `${basePercentage}%` }}
          animate={{
            width: `${targetPercentage}%`,
          }}
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

      {/* Status text */}
      <div className="flex items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-green-600"
            >
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Fragebogen abgeschlossen</span>
            </motion.div>
          ) : (
            <motion.p
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              Frage {current} von {total}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
