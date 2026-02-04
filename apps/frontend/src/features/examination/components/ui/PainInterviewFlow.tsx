/**
 * ProcedureFlow - Step-by-step instructions for clinical procedures.
 *
 * Generic component used for:
 * - Pain interviews (movement-induced pain assessment)
 * - Measurement procedures (opening, excursions)
 * - Any numbered step-based clinical workflow
 */

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  imageMap,
  typedFigureIndex,
  type FigureData,
} from "@/features/protocol/lib/figures";
import { Link } from "@tanstack/react-router";
import { BookOpen, ExternalLink, Image, MousePointerClick, Pause } from "lucide-react";
import type {
  CrossReference,
  ProcedureFlowStep,
  RichMeasurementInstruction,
  RichPainInterviewInstruction,
} from "../../content/types";

/**
 * Get section anchor for a figure number.
 * Maps figure IDs to their corresponding section anchors in section7.
 */
function getFigureAnchor(figureId: string): string {
  const id = figureId.toLowerCase();
  // U1 figures (pain confirmation)
  if (["1", "2", "3"].includes(id))
    return "u1-bestatigung-der-schmerz--und-kopfschmerzlokalisation-durch-den-untersucher";
  // U4 figures (opening movements)
  if (id === "11") return "u4-a-schmerzfreie-offnung";
  if (id === "12") return "u4-b-maximale-nicht-unterstutzte-offnung";
  if (["13", "14"].includes(id)) return "u4-b-maximale-nicht-unterstutzte-offnung";
  if (id === "15") return "u4-c-maximale-unterstutzte-offnung";
  if (id === "16") return "u4-c-maximale-unterstutzte-offnung";
  // Default: link to main section
  return "u4-offnungsbewegungen";
}

/**
 * Get figure data (images and description) for a figure ID.
 */
function getFigureData(figureId: string): FigureData | null {
  const figureKey = `Figure ${figureId}`;
  const figure = typedFigureIndex[figureKey];
  if (figure && "images" in figure) {
    return figure as FigureData;
  }
  return null;
}

/**
 * Figure reference with popover showing image and description.
 */
function FigureRefLink({ figureRef }: { figureRef: string | string[] }) {
  const refs = Array.isArray(figureRef) ? figureRef : [figureRef];
  const label = refs.length === 1 ? `Abb. ${refs[0]}` : `Abb. ${refs.join(" & ")}`;
  const anchor = getFigureAnchor(refs[0]);

  // Collect figure data for all referenced figures
  const figuresData = refs
    .map((id) => ({ id, data: getFigureData(id) }))
    .filter((f) => f.data !== null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary hover:underline"
        >
          <Image className="h-3 w-3" />
          <span>{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="space-y-3 p-3">
          {figuresData.map(({ id, data }) => (
            <div key={id}>
              {/* Images */}
              <div className="flex flex-wrap gap-2 justify-center bg-muted/30 rounded-lg p-2">
                {data!.images.map((img, i) => {
                  const imageUrl = imageMap[img];
                  if (!imageUrl) return null;
                  return (
                    <img
                      key={i}
                      src={imageUrl}
                      alt={`Abbildung ${id}`}
                      className="max-h-32 object-contain rounded"
                    />
                  );
                })}
              </div>
              {/* Caption (short) */}
              <p className="mt-2 text-xs font-medium text-foreground">
                Abb. {id}: {data!.description_de}
              </p>
              {/* Full description from section 7 (when available) */}
              {data!.description_de_full && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {data!.description_de_full}
                </p>
              )}
            </div>
          ))}
          {/* Link to full protocol */}
          <Link
            to="/protocol/$section"
            params={{ section: "section7" }}
            hash={anchor}
            className="flex items-center gap-1 text-xs text-primary hover:underline pt-2 border-t"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Im Protokoll öffnen</span>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ProcedureFlowProps {
  /** Flow steps to display */
  flow: ProcedureFlowStep[];
  /** Optional className */
  className?: string;
}

/**
 * Single procedure step with number, label, and content.
 *
 * Renders patient scripts with quotation marks (italic) and
 * examiner instructions without quotes (normal text).
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
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{step.label}</span>
          {/* Figure reference - inline with label */}
          {step.figureRef && <FigureRefLink figureRef={step.figureRef} />}
        </div>
        {/* Patient script - verbatim text with quotation marks */}
        {step.patientScript && (
          <div className="mt-1 text-sm text-muted-foreground italic">„{step.patientScript}"</div>
        )}
        {/* Examiner instruction - action without quotes */}
        {step.examinerInstruction && (
          <div className="mt-1 text-sm text-muted-foreground">{step.examinerInstruction}</div>
        )}
        {/* Pause indicator - wait for patient */}
        {step.pause && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <Pause className="h-3 w-3 shrink-0" />
            <span>Pause — Warten bis Patient bereit ist</span>
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
      {hasConcise && <CrossReferenceLinks references={conciseSpec} label="Kurzspezifikation" />}
      {hasComplete && <CrossReferenceLinks references={completeSpec} label="Vollständig" />}
      {hasAdditional && <CrossReferenceLinks references={additionalInfo} label="Zusatzinfo" />}
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
