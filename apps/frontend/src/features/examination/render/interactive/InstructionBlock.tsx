/**
 * InstructionBlock - Compact clinical instruction display for examination steps.
 *
 * Shows step identifier, patient communication script, and examiner action
 * in a minimal footprint suitable for clinical use.
 */

import { cn } from "@/lib/utils";
import { MessageSquare, Ruler } from "lucide-react";
import type { StepInstruction } from "../../content/instructions";

interface InstructionBlockProps extends StepInstruction {
  /** Optional className */
  className?: string;
}

/**
 * Compact instruction block for examination steps.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────┐
 * │ [E4A] Title                                     │
 * │ 💬 "Patient script..."                          │
 * │ 📏 Examiner action                              │
 * └─────────────────────────────────────────────────┘
 */
export function InstructionBlock({
  patientScript,
  examinerAction,
  className,
}: InstructionBlockProps) {
  return (
    <div className={cn("rounded-md bg-muted/50 px-3 py-2 text-sm space-y-1", className)}>
      {/* Patient script */}
      <div className="flex items-start gap-2 text-muted-foreground">
        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="italic">"{patientScript}"</span>
      </div>

      {/* Examiner action */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Ruler className="h-3.5 w-3.5 shrink-0" />
        <span>{examinerAction}</span>
      </div>
    </div>
  );
}
