/**
 * JFLS-8 Question Screen
 * All questions are 0-10 scale, reuses ScaleQuestion from GCPS-1M
 */

import type { JFLS8Question } from "@cmdetect/questionnaires";
import { ScaleQuestion } from "../../gcps-1m/components/ScaleQuestion";

type JFLS8QuestionScreenProps = {
  question: JFLS8Question;
  onNavigateNext: () => void;
};

export function JFLS8QuestionScreen({
  question,
  onNavigateNext,
}: JFLS8QuestionScreenProps) {
  // All JFLS-8 questions are scale_0_10 type
  // The ScaleQuestion component accepts questions with id, text, and scaleLabels
  return <ScaleQuestion question={question} onNavigateNext={onNavigateNext} />;
}
