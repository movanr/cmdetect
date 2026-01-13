/**
 * GCPS 1-Month Question Screen
 * Routes to the appropriate question component based on question type
 */

import type { GCPS1MQuestion } from "@cmdetect/questionnaires";
import { ScaleQuestion } from "./ScaleQuestion";
import { NumericQuestion } from "./NumericQuestion";

type GCPS1MQuestionScreenProps = {
  question: GCPS1MQuestion;
  onNavigateNext: () => void;
};

export function GCPS1MQuestionScreen({
  question,
  onNavigateNext,
}: GCPS1MQuestionScreenProps) {
  switch (question.type) {
    case "scale_0_10":
      return <ScaleQuestion question={question} onNavigateNext={onNavigateNext} />;
    case "numeric":
      return <NumericQuestion question={question} onNavigateNext={onNavigateNext} />;
    default:
      return null;
  }
}
