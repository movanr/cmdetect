/**
 * Progress indicator for questionnaires
 * Shows "Question X of Y" with animated progress bar
 * Supports transition animations when completing questionnaire
 */

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { ProgressBar, type TransitionPhase } from "@/components/ProgressBar";

export type { TransitionPhase };

type ProgressHeaderProps = {
  current: number;
  total: number;
  transitionPhase?: TransitionPhase;
  onTransitionPhaseComplete?: (phase: TransitionPhase) => void;
};

export function ProgressHeader({
  current,
  total,
  transitionPhase = "active",
  onTransitionPhaseComplete,
}: ProgressHeaderProps) {
  const progress = Math.round(((current - 1) / total) * 100);
  const isSuccess = transitionPhase === "success" || transitionPhase === "exiting";

  return (
    <div className="space-y-2">
      <ProgressBar
        progress={progress}
        transitionPhase={transitionPhase}
        onTransitionPhaseComplete={onTransitionPhaseComplete}
      />

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
