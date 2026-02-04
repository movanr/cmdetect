/**
 * ProcedureFlow - Step-by-step instructions for clinical procedures.
 *
 * Generic component used for:
 * - Pain interviews (movement-induced pain assessment)
 * - Measurement procedures (opening, excursions)
 * - Any numbered step-based clinical workflow
 */

import { Link } from "@tanstack/react-router";
import { BookOpen, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CrossReference,
  ProcedureFlowStep,
  RichMeasurementInstruction,
  RichPainInterviewInstruction,
} from "../../content/types";

interface ProcedureFlowProps {
  /** Flow steps to display */
  flow: ProcedureFlowStep[];
  /** Optional className */
  className?: string;
}

/**
 * Single procedure step with number, label and description.
 */
function ProcedureStep({
  step,
  stepNumber,
  isLast,
}: {
  step: ProcedureFlowStep;
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
        <div className="font-medium text-sm text-foreground">{step.label}</div>
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
 * Renders a procedure as a numbered step-by-step list.
 */
export function ProcedureFlow({ flow, className }: ProcedureFlowProps) {
  return (
    <div className={cn("rounded-md border border-muted p-4", className)}>
      <div className="space-y-0">
        {flow.map((step, index) => (
          <ProcedureStep
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
 * Cross-reference links to protocol documentation.
 */
function CrossReferenceLinks({
  references,
  label,
}: {
  references: CrossReference[];
  label?: string;
}) {
  if (references.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <BookOpen className="h-3 w-3 shrink-0" />
      {label && <span className="font-medium">{label}:</span>}
      {references.map((ref, index) => (
        <span key={`${ref.section}-${ref.anchor ?? index}`}>
          {index > 0 && <span className="mr-3">·</span>}
          <Link
            to="/protocol/$section"
            params={{ section: ref.section }}
            hash={ref.anchor}
            className="hover:text-primary hover:underline"
          >
            {ref.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

/**
 * Protocol references section with three categories:
 * - Concise specification (section 4 quick reference)
 * - Complete specification (section 5 detailed protocol)
 * - Additional information (section 2, 6 general instructions)
 */
function ProtocolReferences({
  conciseSpec,
  completeSpec,
  additionalInfo,
}: {
  conciseSpec?: CrossReference[];
  completeSpec?: CrossReference[];
  additionalInfo?: CrossReference[];
}) {
  const hasConcise = conciseSpec && conciseSpec.length > 0;
  const hasComplete = completeSpec && completeSpec.length > 0;
  const hasAdditional = additionalInfo && additionalInfo.length > 0;

  if (!hasConcise && !hasComplete && !hasAdditional) return null;

  return (
    <div className="space-y-1 mt-2">
      {hasConcise && (
        <CrossReferenceLinks references={conciseSpec} label="Kurzspezifikation" />
      )}
      {hasComplete && (
        <CrossReferenceLinks references={completeSpec} label="Vollständig" />
      )}
      {hasAdditional && (
        <CrossReferenceLinks references={additionalInfo} label="Zusatzinfo" />
      )}
    </div>
  );
}

/** @deprecated Use ProcedureFlow instead */
export const PainInterviewFlow = ProcedureFlow;

/**
 * Compact version for smaller spaces - just shows the flow labels.
 */
export function ProcedureFlowCompact({
  flow,
  className,
}: {
  flow?: ProcedureFlowStep[];
  className?: string;
}) {
  if (!flow || flow.length === 0) return null;

  return (
    <div className={cn("text-xs text-muted-foreground", className)}>
      {flow.map((step, i) => (
        <span key={step.id}>
          {i > 0 && " → "}
          {step.label}
        </span>
      ))}
    </div>
  );
}

/** @deprecated Use ProcedureFlowCompact instead */
export const PainInterviewFlowCompact = ProcedureFlowCompact;

/**
 * Pain interview instruction block with flow steps.
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
      <ProcedureFlow flow={instruction.flow} />
      <ProtocolReferences
        conciseSpec={instruction.conciseSpec}
        completeSpec={instruction.completeSpec}
        additionalInfo={instruction.additionalInfo}
      />
    </div>
  );
}

/**
 * Measurement instruction block with flow steps and optional warnings.
 */
export function MeasurementFlowBlock({
  instruction,
  className,
}: {
  instruction: RichMeasurementInstruction;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Safety warnings - prominent, always first */}
      {instruction.warnings && instruction.warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          {instruction.warnings.map((warning, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-amber-600">⚠️</span>
              <span>{warning.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step-by-step flow */}
      <ProcedureFlow flow={instruction.flow} />

      {/* Protocol references */}
      <ProtocolReferences
        conciseSpec={instruction.conciseSpec}
        completeSpec={instruction.completeSpec}
        additionalInfo={instruction.additionalInfo}
      />
    </div>
  );
}
