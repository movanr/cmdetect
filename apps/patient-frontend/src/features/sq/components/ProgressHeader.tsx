/**
 * Progress indicator for the questionnaire wizard
 * Shows section-based progress with optional sub-question counter
 * Supports transition animations when completing questionnaire
 */

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { ProgressBar, type TransitionPhase } from "@/components/ProgressBar";

export type { TransitionPhase };

type ProgressHeaderProps = {
  sectionIndex: number;
  totalSections: number;
  sectionName: string;
  questionInSection: number;
  totalInSection: number;
  transitionPhase?: TransitionPhase;
  onTransitionPhaseComplete?: (phase: TransitionPhase) => void;
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
  const progress = Math.round(sectionProgress + questionProgress);

  // Only show sub-question counter if section has more than 1 question
  const showSubCounter = totalInSection > 1;

  const isSuccess = transitionPhase === "success" || transitionPhase === "exiting";

  return (
    <div className="space-y-2">
      <ProgressBar
        progress={progress}
        transitionPhase={transitionPhase}
        onTransitionPhaseComplete={onTransitionPhaseComplete}
      />

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
