/**
 * Progress indicator for the questionnaire wizard
 * Shows section-based progress with optional sub-question counter
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
  sectionIndex: number;
  totalSections: number;
  sectionName: string;
  questionInSection: number;
  totalInSection: number;
  transitionPhase?: TransitionPhase;
  onTransitionPhaseComplete?: (phase: TransitionPhase) => void;
};

// Animation timing (ms)
const TIMING = {
  fillProgress: 280,
  successPause: 560,
};

export function ProgressHeader({
  sectionIndex,
  totalSections,
  sectionName,
  questionInSection,
  totalInSection,
  transitionPhase = "active",
  onTransitionPhaseComplete,
}: ProgressHeaderProps) {
  // Progress is based on sections (each section = 100/totalSections %)
  // Add partial progress for current section based on question position
  const sectionProgress = (sectionIndex / totalSections) * 100;
  const questionProgress = ((questionInSection - 1) / totalInSection) * (100 / totalSections);
  const basePercentage = Math.round(sectionProgress + questionProgress);

  // During transition, show 100%
  const targetPercentage = transitionPhase === "active" ? basePercentage : 100;

  // Only show sub-question counter if section has more than 1 question
  const showSubCounter = totalInSection > 1;

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
      <div className="text-center">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1 text-green-600"
            >
              <Check className="h-4 w-4" />
              <span className="text-sm font-medium">Fragebogen Abgeschlossen</span>
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-muted-foreground">
                Abschnitt {sectionIndex + 1} von {totalSections} · {sectionName}
              </p>
              {showSubCounter && (
                <p className="text-xs text-muted-foreground">
                  Frage {questionInSection} von {totalInSection}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
