/**
 * PainInterviewFlow - Clear step-by-step instructions for pain interview.
 *
 * Displays the DC-TMD pain interview protocol for movement-induced pain:
 * 1. Ask if patient had pain with movement
 * 2. Patient shows with finger where pain was felt
 * 3. Examiner touches area to confirm and identify underlying structure
 * 4. Ask if pain is familiar (+ headache question if temporalis)
 */

import { MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PainInterviewFlowStep,
  RichPainInterviewInstruction,
} from "../../content/types";

interface PainInterviewFlowProps {
  /** Flow steps to display */
  flow: PainInterviewFlowStep[];
  /** Optional className */
  className?: string;
}

/**
 * Single interview step with number, label and description.
 */
function InterviewStep({
  step,
  stepNumber,
  isLast,
}: {
  step: PainInterviewFlowStep;
  stepNumber: number;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Step number indicator */}
      <div className="flex flex-col items-center">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {stepNumber}
        </div>
        {/* Connecting line */}
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>

      {/* Step content */}
      <div className={cn("pb-4", isLast && "pb-0")}>
        <div className="font-medium text-sm text-foreground">{step.question}</div>
        {step.description && (
          <div className="mt-1 text-sm text-muted-foreground italic">
            „{step.description}"
          </div>
        )}
        {step.appAction && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground/80 bg-muted/50 px-2 py-1 rounded w-fit">
            <MousePointerClick className="h-3 w-3 shrink-0" />
            <span>{step.appAction}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Renders the pain interview as a numbered step-by-step list.
 */
export function PainInterviewFlow({ flow, className }: PainInterviewFlowProps) {
  return (
    <div className={cn("rounded-md border border-muted p-4", className)}>
      <div className="space-y-0">
        {flow.map((step, index) => (
          <InterviewStep
            key={step.id}
            step={step}
            stepNumber={index + 1}
            isLast={index === flow.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Compact version for smaller spaces - just shows the flow.
 */
export function PainInterviewFlowCompact({
  flow,
  className,
}: {
  flow?: PainInterviewFlowStep[];
  className?: string;
}) {
  if (!flow || flow.length === 0) return null;

  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      {flow.map((step, i) => (
        <span key={step.id}>
          {i > 0 && " → "}
          {step.question}
        </span>
      ))}
    </div>
  );
}

/**
 * Full pain interview instruction block.
 */
export function PainInterviewBlock({
  instruction,
  className,
}: {
  instruction: RichPainInterviewInstruction;
  showFlow?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <PainInterviewFlow flow={instruction.flow} />
    </div>
  );
}
