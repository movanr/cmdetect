/**
 * Inline question item with direct editing (no edit button)
 * Used for SQ1-SQ7 questions
 */

import { SQ_YES_NO_LABELS } from "@cmdetect/questionnaires";
import { DurationEditor } from "./editors/DurationEditor";
import { SQ3Editor } from "./editors/SQ3Editor";

type AnswerType = "yesno" | "duration" | "sq3";

interface InlineQuestionItemProps {
  questionId: string;
  questionText: string;
  answer: unknown;
  answerType: AnswerType;
  onSave: (questionId: string, newValue: unknown) => Promise<void>;
  isSaving?: boolean;
}

export function InlineQuestionItem({
  questionId,
  questionText,
  answer,
  answerType,
  onSave,
  isSaving = false,
}: InlineQuestionItemProps) {
  const handleChange = async (newValue: unknown) => {
    await onSave(questionId, newValue);
  };

  const renderEditor = () => {
    switch (answerType) {
      case "yesno":
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`inline-${questionId}`}
                checked={answer === "no"}
                onChange={() => handleChange("no")}
                disabled={isSaving}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm">{SQ_YES_NO_LABELS["no"]}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`inline-${questionId}`}
                checked={answer === "yes"}
                onChange={() => handleChange("yes")}
                disabled={isSaving}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm">{SQ_YES_NO_LABELS["yes"]}</span>
            </label>
          </div>
        );
      case "duration":
        return (
          <DurationEditor
            value={(answer as { years?: number; months?: number }) || { years: 0, months: 0 }}
            onChange={handleChange}
          />
        );
      case "sq3":
        return (
          <SQ3Editor
            value={(answer as string) || ""}
            onChange={handleChange}
          />
        );
    }
  };

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Question ID badge */}
        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
          {questionId}
        </span>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Question text */}
          <p className="text-sm text-muted-foreground mb-2">{questionText}</p>

          {/* Inline editor */}
          <div className="mt-1">
            {renderEditor()}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Determine the answer type for a question ID
 */
// eslint-disable-next-line react-refresh/only-export-components
export function getAnswerType(questionId: string): AnswerType {
  if (questionId === "SQ2" || questionId === "SQ6") {
    return "duration";
  }
  if (questionId === "SQ3") {
    return "sq3";
  }
  return "yesno";
}
