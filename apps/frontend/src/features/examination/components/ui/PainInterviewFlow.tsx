/**
 * ProcedureFlow - Step-by-step instructions for clinical procedures.
 *
 * Generic component used for:
 * - Pain interviews (movement-induced pain assessment)
 * - Measurement procedures (opening, excursions)
 * - Any numbered step-based clinical workflow
 */

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { imageMap, typedFigureIndex, type FigureData } from "@/features/protocol/lib/figures";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Image,
  CornerDownRight,
  MousePointerClick,
  Pause,
} from "lucide-react";
import { useState } from "react";
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

  // U1 figures (pain confirmation) - figures 1-3
  if (["1", "2", "3"].includes(id))
    return "u1-bestatigung-der-schmerz--und-kopfschmerzlokalisation-durch-den-untersucher";

  // U2 figures (incisal relationships) - figures 4-8
  if (["4", "5a", "5b", "6", "7", "8"].includes(id)) return "u2-schneidekantenverhältnisse";

  // U3 figures (opening pattern) - figures 9, 10a, 10b
  if (["9", "10a", "10b"].includes(id)) return "u3-offnungsmuster";

  // U4 figures (opening movements) - figures 11-16
  if (id === "11") return "u4-a-schmerzfreie-offnung";
  if (id === "12") return "u4-b-maximale-nicht-unterstutzte-offnung";
  if (["13", "14"].includes(id)) return "u4-b-maximale-nicht-unterstutzte-offnung";
  if (id === "15") return "u4-c-maximale-unterstutzte-offnung";
  if (id === "16") return "u4-c-maximale-unterstutzte-offnung";

  // U9 figures (palpation) - figures 24-36
  if (["24", "25"].includes(id)) return "u9-allgemeine-instruktionen";
  if (["26", "27", "28", "29", "30"].includes(id)) return "u9-m-temporalis-und-m-masseter";
  if (["31", "32", "33"].includes(id)) return "u9-lateraler-kondylenpol";
  if (["34", "35", "36"].includes(id)) return "u9-um-den-lateralen-kondylenpol";

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
                <p className="mt-1 text-xs text-muted-foreground">{data!.description_de_full}</p>
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
        {/* Condition indicator - when step only applies under certain conditions */}
        {step.condition && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <CornerDownRight className="h-3 w-3 shrink-0" />
            <span>{step.condition}</span>
          </div>
        )}
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
 * Protocol references as a collapsible dropdown with flat list.
 * Each item shows "X.Y Title" as a link to the protocol section.
 */
function ProtocolReferences({ protocolRefs }: { protocolRefs?: CrossReference[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!protocolRefs || protocolRefs.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <BookOpen className="h-3 w-3" />
        <span>Protokoll-Referenzen</span>
      </button>
      {isOpen && (
        <ul className="mt-1.5 ml-4 pl-2 border-l border-muted space-y-1">
          {protocolRefs.map((ref, i) => (
            <li key={`${ref.section}-${ref.anchor ?? i}`}>
              <Link
                to="/protocol/$section"
                params={{ section: ref.section }}
                hash={ref.anchor}
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {ref.label}
              </Link>
            </li>
          ))}
        </ul>
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
      <ProtocolReferences protocolRefs={instruction.protocolRefs} />
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
      <ProtocolReferences protocolRefs={instruction.protocolRefs} />
    </div>
  );
}
