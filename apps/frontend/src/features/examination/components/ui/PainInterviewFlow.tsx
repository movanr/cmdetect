/**
 * PainInterviewFlow - Compact flow visualization for pain interview sequence.
 *
 * Shows the decision tree for pain assessment:
 * Schmerz? ──yes──> Zeigen ──> Bekannt? ──yes──> ✓
 *     │                            │
 *    no                           no
 *     ▼                            ▼
 *    ✓                            ✓
 *
 * Additional questions for specific regions:
 * - Temporalis: + Bekannter Kopfschmerz?
 * - All regions: + Zieht es woanders hin? (spreading)
 */

import { cn } from "@/lib/utils";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import type { PainInterviewFlowStep, RichPainInterviewInstruction } from "../../content/types";

interface PainInterviewFlowProps {
  /** Flow steps to display */
  flow: PainInterviewFlowStep[];
  /** Optional className */
  className?: string;
}

/**
 * Renders a single flow node (question or endpoint)
 */
function FlowNode({
  question,
  isEndpoint = false,
  className,
}: {
  question: string;
  isEndpoint?: boolean;
  className?: string;
}) {
  if (isEndpoint) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Check className="h-4 w-4 text-green-600" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-2 py-1 rounded border border-muted-foreground/30 text-xs text-muted-foreground",
        "bg-background",
        className
      )}
    >
      {question}
    </div>
  );
}

/**
 * Arrow with label for flow connections
 */
function FlowArrow({
  label,
  direction = "right",
  className,
}: {
  label: string;
  direction?: "right" | "down";
  className?: string;
}) {
  if (direction === "down") {
    return (
      <div className={cn("flex flex-col items-center text-[10px] text-muted-foreground/70", className)}>
        <span>{label}</span>
        <span>↓</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-0.5 text-[10px] text-muted-foreground/70", className)}>
      <span>─{label}─</span>
      <span>→</span>
    </div>
  );
}

/**
 * Compact horizontal flow visualization.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────┐
 * │ Schmerz? ──ja──> Zeigen ──> Bekannt? ──ja──> ✓              │
 * │     │                           │                            │
 * │    nein                        nein                          │
 * │     ↓                           ↓                            │
 * │     ✓                           ✓                            │
 * │                                                              │
 * │ + Temporalis: Bekannter Kopfschmerz?                        │
 * │ + Alle: Zieht es woanders hin?                              │
 * └──────────────────────────────────────────────────────────────┘
 */
export function PainInterviewFlow({ flow, className }: PainInterviewFlowProps) {
  // Find region-specific questions
  const regionSpecificQuestions = flow.flatMap((step) => step.regionSpecific || []);

  return (
    <div className={cn("rounded-md border border-muted p-3 space-y-2", className)}>
      {/* Main flow - horizontal layout */}
      <div className="flex items-start gap-1 overflow-x-auto">
        {flow.map((step, index) => (
          <div key={step.id} className="flex items-start">
            {/* Question node with yes/no branches */}
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <FlowNode question={step.question} />
                {/* Yes branch (horizontal) */}
                {step.nextOnYes && (
                  <>
                    <FlowArrow label="ja" />
                    {step.nextOnYes === "end" ? (
                      <FlowNode question="" isEndpoint />
                    ) : null}
                  </>
                )}
              </div>

              {/* No branch (vertical) */}
              {step.nextOnNo && (
                <div className="flex flex-col items-center mt-0.5">
                  <FlowArrow label="nein" direction="down" />
                  <FlowNode question="" isEndpoint />
                </div>
              )}
            </div>

            {/* Connector to next main step */}
            {index < flow.length - 1 && step.nextOnYes && step.nextOnYes !== "end" && (
              <ArrowRight className="h-3 w-3 text-muted-foreground/50 mx-1 mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Region-specific additional questions */}
      {regionSpecificQuestions.length > 0 && (
        <div className="pt-2 border-t border-muted space-y-1">
          {regionSpecificQuestions.map((q, index) => (
            <div key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="text-muted-foreground/60">+</span>
              <span className="font-medium">{q.region}:</span>
              <span>{q.question}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Simplified flow display for compact spaces.
 * Shows just the text flow without visual arrows.
 */
export function PainInterviewFlowCompact({
  guidance,
  className,
}: {
  guidance: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <HelpCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{guidance}</span>
    </div>
  );
}

/**
 * Full pain interview instruction block with prompt and flow.
 */
export function PainInterviewBlock({
  instruction,
  showFlow = true,
  className,
}: {
  instruction: RichPainInterviewInstruction;
  showFlow?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Patient prompt */}
      <div className="rounded-md bg-muted/50 px-3 py-2 text-sm space-y-1">
        <div className="text-muted-foreground italic">"{instruction.prompt}"</div>
        <div className="text-muted-foreground text-xs">{instruction.guidance}</div>
      </div>

      {/* Flow visualization */}
      {showFlow && instruction.flow.length > 0 && (
        <PainInterviewFlow flow={instruction.flow} />
      )}
    </div>
  );
}
