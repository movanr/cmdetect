/**
 * Question screen dispatcher
 * Renders the appropriate question component based on type
 */

import type { SQQuestion } from "@cmdetect/questionnaires";
import { SingleChoiceQuestion } from "./questions/SingleChoiceQuestion";
import { CompositeNumberQuestion } from "./questions/CompositeNumberQuestion";
import { MatrixRowQuestion } from "./questions/MatrixRowQuestion";

type QuestionScreenProps = {
  question: SQQuestion;
  error?: string;
  onNavigateNext: (selectedValue?: string) => void;
};

export function QuestionScreen({
  question,
  error,
  onNavigateNext,
}: QuestionScreenProps) {
  switch (question.type) {
    case "single_choice":
      return (
        <SingleChoiceQuestion
          question={question}
          onNavigateNext={onNavigateNext}
        />
      );

    case "composite_number":
      return <CompositeNumberQuestion question={question} error={error} />;

    case "matrix_row":
      return (
        <MatrixRowQuestion question={question} onNavigateNext={onNavigateNext} />
      );

    default:
      // TypeScript exhaustive check
      const _exhaustive: never = question;
      throw new Error(`Unknown question type: ${_exhaustive}`);
  }
}
