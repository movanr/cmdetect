/**
 * InlinePainBadges - Pain assessment badges for selected region.
 *
 * Dynamically renders badges from question definitions.
 * Uses enableWhen to determine if follow-up questions are clickable.
 */

import { useFormContext } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Question } from "../../model/question";
import { ANSWER_VALUES, type AnswerValue } from "../../model/answer";
import { PAIN_TYPES } from "../../model/pain";
import { getLabel } from "../../content/labels";
import type { RegionId } from "./types";
import { parseRegionId } from "./types";

interface InlinePainBadgesProps {
  selectedRegion: RegionId;
  /** Questions for this specific region */
  questions: Question[];
  /** Check if a question is enabled */
  isQuestionEnabled: (question: Question) => boolean;
  /** Toggle answer callback */
  onToggleAnswer: (question: Question, value: AnswerValue) => void;
  className?: string;
}

export function InlinePainBadges({
  selectedRegion,
  questions,
  isQuestionEnabled,
  onToggleAnswer,
  className,
}: InlinePainBadgesProps) {
  const { getValues } = useFormContext();
  const { side, region } = parseRegionId(selectedRegion);

  // Get region and side labels from centralized content
  const regionLabel = getLabel(region);
  const sideLabel = getLabel(side);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 p-3 bg-muted/50 rounded-lg",
        className
      )}
    >
      {/* Region label on top */}
      <span className="text-sm font-medium">
        {regionLabel}, {sideLabel}
      </span>

      {/* Questions in vertical layout - rendered dynamically */}
      <div className="flex flex-col gap-2">
        {questions.map((question) => {
          const enabled = isQuestionEnabled(question);
          // Use getValues() with instanceId path - RHF handles nested structure resolution
          const currentValue = getValues(question.instanceId) as
            | AnswerValue
            | undefined;
          const isYes = currentValue === ANSWER_VALUES.YES;
          const isNo = currentValue === ANSWER_VALUES.NO;
          const hasData = currentValue !== undefined && currentValue !== null;

          // Get label from centralized content
          const label = getLabel(question.semanticId);

          // Determine if this is a "clinically significant" question (red when yes)
          // Pain itself is not red, but familiar pain and familiar headache are
          const isClinicallySignificant =
            question.semanticId !== PAIN_TYPES.PAIN;

          return (
            <div
              key={question.instanceId}
              className="flex items-center justify-between gap-4"
            >
              <span
                className={cn(
                  "text-sm",
                  enabled ? "text-muted-foreground" : "text-muted-foreground/50"
                )}
              >
                {label}:
              </span>
              <div className="flex items-center gap-1">
                {/* "Nein" badge */}
                <Badge
                  variant={hasData && isNo ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer select-none transition-colors",
                    !enabled && "opacity-50 cursor-not-allowed",
                    hasData && isNo
                      ? "hover:bg-primary/80"
                      : "hover:bg-primary/10 hover:text-primary hover:border-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (enabled) {
                      onToggleAnswer(question, ANSWER_VALUES.NO);
                    }
                  }}
                >
                  Nein
                </Badge>

                {/* "Ja" badge */}
                <Badge
                  variant={
                    isYes
                      ? isClinicallySignificant
                        ? "destructive"
                        : "default"
                      : "outline"
                  }
                  className={cn(
                    "cursor-pointer select-none transition-colors",
                    !enabled && "opacity-50 cursor-not-allowed",
                    isYes
                      ? isClinicallySignificant
                        ? "hover:bg-destructive/80"
                        : "hover:bg-primary/80"
                      : isClinicallySignificant
                        ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        : "hover:bg-primary/10 hover:text-primary hover:border-primary"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (enabled) {
                      onToggleAnswer(question, ANSWER_VALUES.YES);
                    }
                  }}
                >
                  Ja
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
