/**
 * PhaseInstructionBlock - Multi-phase procedure display for complex examination steps.
 *
 * Used for procedures that have distinct phases (e.g., E4C assisted opening):
 * 1. Vorbereitung (Preparation)
 * 2. Durchführung (Execution)
 * 3. Messung (Measurement)
 *
 * Features:
 * - Phase indicator dots (●○○)
 * - Phase-specific content (script, steps, warnings)
 * - Phase navigation buttons
 * - Completion callback when all phases done
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, MessageSquare } from "lucide-react";
import { useCallback, useState } from "react";
import type { ProcedurePhase, SafetyWarning } from "../../content/types";
import { ExpandableDetails } from "./ExpandableDetails";
import { SafetyWarnings } from "./SafetyWarningBanner";
import { TextSegmentRenderer } from "./TextSegmentRenderer";

interface PhaseInstructionBlockProps {
  /** Array of procedure phases */
  phases: ProcedurePhase[];
  /** Global warnings that apply to all phases */
  globalWarnings?: SafetyWarning[];
  /** Called when user advances past the last phase */
  onComplete?: () => void;
  /** Optional className */
  className?: string;
}

/**
 * Phase indicator - shows dots for each phase, filled for current/completed
 */
function PhaseIndicator({
  phases,
  currentIndex,
  onPhaseClick,
}: {
  phases: ProcedurePhase[];
  currentIndex: number;
  onPhaseClick?: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {phases.map((phase, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <button
            key={phase.id}
            type="button"
            onClick={() => onPhaseClick?.(index)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
              isActive && "bg-primary text-primary-foreground",
              isCompleted && "bg-muted text-muted-foreground hover:bg-muted/80",
              !isActive && !isCompleted && "bg-muted/50 text-muted-foreground/60"
            )}
            disabled={index > currentIndex}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isActive && "bg-primary-foreground",
                isCompleted && "bg-muted-foreground",
                !isActive && !isCompleted && "bg-muted-foreground/40"
              )}
            />
            {phase.name}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Renders content for a single phase
 */
function PhaseContent({
  phase,
  className,
}: {
  phase: ProcedurePhase;
  className?: string;
}) {
  const hasScript = phase.patientScript != null;
  const hasSteps = phase.examinerSteps && phase.examinerSteps.length > 0;
  const hasTips = phase.tips && phase.tips.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Patient script for this phase */}
      {hasScript && (
        <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="italic">
              "<TextSegmentRenderer script={phase.patientScript!} />"
            </span>
          </div>
        </div>
      )}

      {/* Examiner steps - always visible for phases (not expandable) */}
      {hasSteps && (
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
          {phase.examinerSteps.map((step, index) => (
            <li key={index} className="leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      )}

      {/* Tips */}
      {hasTips && (
        <ExpandableDetails title="Hinweise" tips={phase.tips} defaultExpanded={false} />
      )}
    </div>
  );
}

/**
 * Multi-phase instruction block for complex procedures.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────┐
 * │ Phase: [● Vorbereitung] [○ Durchführung] [○ M.] │
 * │                                                  │
 * │ ⚠️ Bei Handheben sofort stoppen!                │
 * │                                                  │
 * │ 💬 "Patient script for current phase..."        │
 * │                                                  │
 * │ 1. Examiner step 1                              │
 * │ 2. Examiner step 2                              │
 * │                                                  │
 * │ [← Zurück]               [Weiter zur Phase →]   │
 * └─────────────────────────────────────────────────┘
 */
export function PhaseInstructionBlock({
  phases,
  globalWarnings,
  onComplete,
  className,
}: PhaseInstructionBlockProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const currentPhase = phases[currentPhaseIndex];
  const isFirstPhase = currentPhaseIndex === 0;
  const isLastPhase = currentPhaseIndex === phases.length - 1;

  const handlePrevious = useCallback(() => {
    if (!isFirstPhase) {
      setCurrentPhaseIndex((i) => i - 1);
    }
  }, [isFirstPhase]);

  const handleNext = useCallback(() => {
    if (isLastPhase) {
      onComplete?.();
    } else {
      setCurrentPhaseIndex((i) => i + 1);
    }
  }, [isLastPhase, onComplete]);

  const handlePhaseClick = useCallback(
    (index: number) => {
      // Only allow clicking on current or previous phases
      if (index <= currentPhaseIndex) {
        setCurrentPhaseIndex(index);
      }
    },
    [currentPhaseIndex]
  );

  // Get next phase name for button label
  const nextPhaseName = !isLastPhase ? phases[currentPhaseIndex + 1]?.name : null;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Phase indicator */}
      <PhaseIndicator
        phases={phases}
        currentIndex={currentPhaseIndex}
        onPhaseClick={handlePhaseClick}
      />

      {/* Global warnings - shown for all phases */}
      {globalWarnings && globalWarnings.length > 0 && (
        <SafetyWarnings warnings={globalWarnings} />
      )}

      {/* Current phase content */}
      <PhaseContent phase={currentPhase} />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-muted">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirstPhase}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>

        <Button type="button" variant="default" size="sm" onClick={handleNext}>
          {isLastPhase ? (
            <>Zur Messung</>
          ) : (
            <>
              {nextPhaseName ? `Weiter: ${nextPhaseName}` : "Weiter"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
