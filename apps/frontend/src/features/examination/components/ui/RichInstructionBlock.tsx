/**
 * RichInstructionBlock - Extended instruction display for examination steps.
 *
 * Builds on InstructionBlock with additional features:
 * - Safety warnings (prominent banners)
 * - Styled patient scripts (verbatim, optional, etc.)
 * - Expandable examiner steps
 * - Cross-references to protocol sections
 *
 * Implements progressive disclosure:
 * Level 1 (always visible): Warning + Patient script + Examiner action
 * Level 2 (expandable): Detailed steps + Tips + Cross-references
 */

import { cn } from "@/lib/utils";
import { BookOpen, MessageSquare, MousePointerClick, Ruler } from "lucide-react";
import type { CrossReference, PatientScript, RichStepInstruction, SafetyWarning } from "../../content/types";
import { ExpandableDetails } from "./ExpandableDetails";
import { SafetyWarnings } from "./SafetyWarningBanner";
import { TextSegmentRenderer } from "./TextSegmentRenderer";

interface RichInstructionBlockProps {
  /** Patient communication script (simple string or styled segments) */
  patientScript: PatientScript;
  /** Primary examiner action (always visible) */
  examinerAction: string;
  /** Detailed examiner steps (expandable) */
  examinerSteps?: string[];
  /** Safety warnings to display prominently */
  warnings?: SafetyWarning[];
  /** Cross-references to protocol sections */
  crossReferences?: CrossReference[];
  /** Tips for the examiner */
  tips?: string[];
  /** Optional hint about app interaction for this step */
  appAction?: string;
  /** Optional className */
  className?: string;
}

/**
 * Cross-reference links display
 */
function CrossReferenceLinks({
  references,
  className,
}: {
  references: CrossReference[];
  className?: string;
}) {
  if (references.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <BookOpen className="h-3 w-3 shrink-0" />
      <span>
        {references.map((ref, index) => (
          <span key={ref.section}>
            {index > 0 && ", "}
            <span className="font-medium">{ref.label}</span>
            <span className="text-muted-foreground/70"> ({ref.section})</span>
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * Extended instruction block with warnings, styled scripts, and expandable details.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────┐
 * │ ⚠️ Safety warning (if present)                  │
 * ├─────────────────────────────────────────────────┤
 * │ 💬 "Patient script with styling..."             │
 * │ 📏 Primary examiner action                      │
 * ├─────────────────────────────────────────────────┤
 * │ ▶ Technik-Details (expandable)                  │
 * │   1. Step 1                                     │
 * │   2. Step 2                                     │
 * │   💡 Tip                                        │
 * ├─────────────────────────────────────────────────┤
 * │ → Cross-references                              │
 * └─────────────────────────────────────────────────┘
 */
export function RichInstructionBlock({
  patientScript,
  examinerAction,
  examinerSteps,
  warnings,
  crossReferences,
  tips,
  appAction,
  className,
}: RichInstructionBlockProps) {
  const hasWarnings = warnings && warnings.length > 0;
  const hasExpandableContent = (examinerSteps && examinerSteps.length > 0) || (tips && tips.length > 0);
  const hasCrossReferences = crossReferences && crossReferences.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Safety warnings - prominent, always first */}
      {hasWarnings && <SafetyWarnings warnings={warnings} />}

      {/* Main instruction block */}
      <div className="rounded-md bg-muted/50 px-3 py-2 text-sm space-y-1">
        {/* Patient script with styled segments */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="italic">
            "<TextSegmentRenderer script={patientScript} />"
          </span>
        </div>

        {/* Primary examiner action */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Ruler className="h-3.5 w-3.5 shrink-0" />
          <span>{examinerAction}</span>
        </div>

        {/* App action hint */}
        {appAction && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground/80 bg-muted/50 px-2 py-1 rounded w-fit">
            <MousePointerClick className="h-3 w-3 shrink-0" />
            <span>{appAction}</span>
          </div>
        )}
      </div>

      {/* Expandable details section */}
      {hasExpandableContent && (
        <ExpandableDetails title="Technik-Details" steps={examinerSteps} tips={tips} />
      )}

      {/* Cross-references */}
      {hasCrossReferences && <CrossReferenceLinks references={crossReferences} />}
    </div>
  );
}

/**
 * Helper to create RichInstructionBlock props from a RichStepInstruction
 */
export function richInstructionToProps(instruction: RichStepInstruction): RichInstructionBlockProps {
  return {
    patientScript: instruction.patientScript,
    examinerAction: instruction.examinerAction,
    examinerSteps: instruction.examinerSteps,
    warnings: instruction.warnings,
    crossReferences: instruction.crossReferences,
    tips: instruction.tips,
    appAction: instruction.appAction,
  };
}
