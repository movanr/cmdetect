/**
 * Read-only SQ (Symptom Questionnaire) display
 * Used in the dashboard for reviewing patient answers before interactive review
 */

import {
  SQ_SECTION_NAMES_ORDER,
  SQ_QUESTION_ORDER,
  SQ_QUESTION_LABELS,
  SQ_ENABLE_WHEN,
  SQ_OFFICE_USE_QUESTIONS,
  SQ_YES_NO_LABELS,
  SQ_PAIN_FREQUENCY_LABELS,
  isQuestionIdEnabled,
  type SQQuestionId,
} from "@cmdetect/questionnaires";
import { Badge } from "@/components/ui/badge";

interface SQReadOnlyViewProps {
  answers: Record<string, unknown>;
}

/**
 * Format an answer value for display
 */
function formatAnswer(questionId: SQQuestionId, value: unknown): string {
  if (value === undefined || value === null) {
    return "—";
  }

  // Duration questions (SQ2, SQ6)
  if (questionId === "SQ2" || questionId === "SQ6") {
    const duration = value as { years?: number; months?: number };
    const parts: string[] = [];
    if (duration.years) {
      parts.push(`${duration.years} ${duration.years === 1 ? "Jahr" : "Jahre"}`);
    }
    if (duration.months) {
      parts.push(`${duration.months} ${duration.months === 1 ? "Monat" : "Monate"}`);
    }
    return parts.length > 0 ? parts.join(", ") : "—";
  }

  // SQ3 (pain frequency)
  if (questionId === "SQ3") {
    return SQ_PAIN_FREQUENCY_LABELS[value as string] ?? String(value);
  }

  // Yes/No questions
  if (typeof value === "string") {
    return SQ_YES_NO_LABELS[value] ?? value;
  }

  return String(value);
}

/**
 * Get office use confirmation status for a question
 */
function getOfficeUseStatus(
  questionId: SQQuestionId,
  answers: Record<string, unknown>
): { hasOfficeUse: boolean; sides: string[] } {
  const officeUseKey = `${questionId}_office`;
  const officeUse = answers[officeUseKey] as
    | { R?: boolean; L?: boolean; DNK?: boolean }
    | undefined;

  if (!officeUse) {
    return { hasOfficeUse: false, sides: [] };
  }

  const sides: string[] = [];
  if (officeUse.R) sides.push("Rechts");
  if (officeUse.L) sides.push("Links");
  if (officeUse.DNK) sides.push("Unklar");

  return { hasOfficeUse: sides.length > 0, sides };
}

export function SQReadOnlyView({ answers }: SQReadOnlyViewProps) {
  // Group questions by section
  const answersBySection: Record<
    string,
    Array<{ id: SQQuestionId; answer: unknown }>
  > = {};

  SQ_QUESTION_ORDER.forEach((questionId) => {
    const label = SQ_QUESTION_LABELS[questionId];
    if (!label) return;

    // Check if question is enabled based on current answers
    if (!isQuestionIdEnabled(questionId, SQ_ENABLE_WHEN, answers)) return;

    const answer = answers[questionId];

    if (!answersBySection[label.section]) {
      answersBySection[label.section] = [];
    }
    answersBySection[label.section].push({ id: questionId, answer });
  });

  return (
    <div className="space-y-4">
      {SQ_SECTION_NAMES_ORDER.map((section) => {
        const sectionAnswers = answersBySection[section];
        if (!sectionAnswers || sectionAnswers.length === 0) return null;

        return (
          <div key={section}>
            {/* Section header */}
            <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
              {section}
            </h5>

            <div className="border rounded-lg divide-y">
              {sectionAnswers.map(({ id, answer }) => {
                const label = SQ_QUESTION_LABELS[id];
                const isOfficeUseQuestion = SQ_OFFICE_USE_QUESTIONS.has(id);
                const { hasOfficeUse, sides } = isOfficeUseQuestion
                  ? getOfficeUseStatus(id, answers)
                  : { hasOfficeUse: false, sides: [] };

                // Check if yes answer needs office confirmation
                const needsConfirmation =
                  isOfficeUseQuestion && answer === "yes" && !hasOfficeUse;

                return (
                  <div key={id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">
                          {label?.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-medium">
                          {formatAnswer(id, answer)}
                        </span>
                        {hasOfficeUse && (
                          <Badge variant="outline" className="text-xs">
                            {sides.join(", ")}
                          </Badge>
                        )}
                        {needsConfirmation && (
                          <Badge
                            variant="outline"
                            className="text-xs text-amber-600 border-amber-300"
                          >
                            Bestätigung fehlt
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
