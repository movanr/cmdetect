/**
 * SymptomQuestionnaireReference — Collapsible full SQ (SF1–SF14) reference card.
 *
 * Displays every SQ question with its patient answer in the standard
 * badge + short-label + value format, grouped by section. Disabled
 * questions (not reached due to skip logic) show "—" with muted styling.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  isQuestionIdEnabled,
  SQ_DISPLAY_IDS,
  SQ_ENABLE_WHEN,
  SQ_QUESTION_SHORT_LABELS,
  SQ_SECTIONS,
  type SQQuestionId,
} from "@cmdetect/questionnaires";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { translateValue } from "../utils/criterion-data-display";

function formatDuration(value: unknown): string {
  if (value == null || typeof value !== "object") return "—";
  const v = value as { years?: number; months?: number };
  const parts: string[] = [];
  if (v.years != null && v.years > 0) parts.push(`${v.years} Jahre`);
  if (v.months != null && v.months > 0) parts.push(`${v.months} Monate`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

const DURATION_QUESTIONS = new Set<SQQuestionId>(["SQ2", "SQ6"]);

function formatAnswer(id: SQQuestionId, value: unknown): string {
  if (DURATION_QUESTIONS.has(id)) return formatDuration(value);
  return translateValue(value);
}

interface SymptomQuestionnaireReferenceProps {
  criteriaData: Record<string, unknown>;
  className?: string;
}

export function SymptomQuestionnaireReference({
  criteriaData,
  className,
}: SymptomQuestionnaireReferenceProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sqData = useMemo(
    () => (criteriaData["sq"] as Record<string, unknown> | undefined) ?? {},
    [criteriaData],
  );

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        type="button"
        className="flex items-center gap-2 w-full py-2.5 px-3 hover:bg-muted/50 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium flex-1">Symptom-Fragebogen (SF1–SF14)</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="border-t px-3 py-3 space-y-4">
          {SQ_SECTIONS.map((section) => (
            <div key={section.id}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1">
                {section.name}
              </div>
              <div className="space-y-1">
                {section.questionIds.map((qId) => {
                  const enabled = isQuestionIdEnabled(qId, SQ_ENABLE_WHEN, sqData);
                  const value = sqData[qId];
                  const displayId = SQ_DISPLAY_IDS[qId];
                  const label = SQ_QUESTION_SHORT_LABELS[qId];

                  return (
                    <div
                      key={qId}
                      className={cn(
                        "flex items-baseline gap-1.5 text-xs",
                        !enabled && "opacity-40",
                      )}
                    >
                      <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
                        {displayId}
                      </Badge>
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="font-medium whitespace-nowrap">
                        {enabled ? formatAnswer(qId, value) : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
