/**
 * SQ Section Step - Renders all enabled questions in one section
 *
 * Uses React Hook Form context with FormField components for:
 * - Type-safe form state
 * - Real-time Zod validation
 * - Consistent shadcn UI components
 */

import {
  SQ_ENABLE_WHEN,
  SQ_OFFICE_USE_QUESTIONS,
  SQ_QUESTION_LABELS,
  isQuestionIdEnabled,
  type SQSection,
  type SQQuestionId,
} from "@cmdetect/questionnaires";
import { useFormContext } from "react-hook-form";
import type { SQFormValues, SQOfficeUseKey, SQQuestionKey } from "../../schema/sqZodSchemas";
import {
  YesNoFormField,
  DurationFormField,
  PainFrequencyFormField,
  OfficeUseFormField,
} from "../form-fields";

interface SQSectionStepProps {
  section: SQSection;
}

export function SQSectionStep({ section }: SQSectionStepProps) {
  const { watch } = useFormContext<SQFormValues>();
  const answers = watch();

  // Filter to only show enabled questions in this section
  const enabledQuestions = section.questionIds.filter((qId) =>
    isQuestionIdEnabled(qId, SQ_ENABLE_WHEN, answers)
  );

  if (enabledQuestions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Keine Fragen in diesem Abschnitt basierend auf vorherigen Antworten.
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{section.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {enabledQuestions.length}{" "}
          {enabledQuestions.length === 1 ? "Frage" : "Fragen"} in diesem
          Abschnitt
        </p>
      </div>

      {/* Questions */}
      <div className="border rounded-lg px-4">
        {enabledQuestions.map((questionId) => {
          const label = SQ_QUESTION_LABELS[questionId];
          const isOfficeUseQuestion = SQ_OFFICE_USE_QUESTIONS.has(questionId);

          return (
            <QuestionRow
              key={questionId}
              questionId={questionId}
              questionText={label?.text || questionId}
              isOfficeUseQuestion={isOfficeUseQuestion}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Determine the input type for a question
 */
function getQuestionType(
  questionId: SQQuestionId
): "yesno" | "duration" | "painFrequency" {
  if (questionId === "SQ2" || questionId === "SQ6") return "duration";
  if (questionId === "SQ3") return "painFrequency";
  return "yesno";
}

/**
 * Question row with appropriate FormField component
 */
function QuestionRow({
  questionId,
  questionText,
  isOfficeUseQuestion,
}: {
  questionId: SQQuestionId;
  questionText: string;
  isOfficeUseQuestion: boolean;
}) {
  const { watch } = useFormContext<SQFormValues>();
  const patientAnswer = watch(questionId as SQQuestionKey);
  const isYes = patientAnswer === "yes";

  const questionType = getQuestionType(questionId);
  const officeUseKey = `${questionId}_office` as SQOfficeUseKey;

  const renderEditor = () => {
    switch (questionType) {
      case "duration":
        return <DurationFormField name={questionId as "SQ2" | "SQ6"} />;
      case "painFrequency":
        return <PainFrequencyFormField />;
      case "yesno":
      default:
        return <YesNoFormField name={questionId as SQQuestionKey} />;
    }
  };

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
          {questionId}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-2">{questionText}</p>
          <div className="flex flex-wrap items-center gap-4">
            {renderEditor()}

            {/* Office-use confirmation - only shown when answer is "yes" */}
            {isOfficeUseQuestion && isYes && (
              <>
                <div className="w-px h-5 bg-border" />
                <OfficeUseFormField name={officeUseKey} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
