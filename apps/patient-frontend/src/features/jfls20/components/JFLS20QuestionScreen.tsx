/**
 * JFLS-20 Question Screen
 * All questions are 0-10 scale, reuses ScaleQuestion from GCPS-1M
 */

import type { JFLS20Question } from "@cmdetect/questionnaires";
import { Button } from "@/components/ui/button";
import { ScaleQuestion } from "../../gcps-1m/components/ScaleQuestion";

type JFLS20QuestionScreenProps = {
  question: JFLS20Question;
  onNavigateNext: () => void;
  onSkip: () => void;
};

export function JFLS20QuestionScreen({
  question,
  onNavigateNext,
  onSkip,
}: JFLS20QuestionScreenProps) {
  // All JFLS-20 questions are scale_0_10 type
  // The ScaleQuestion component accepts questions with id, text, and scaleLabels
  return (
    <>
      <ScaleQuestion question={question} onNavigateNext={onNavigateNext} />
      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          Frage überspringen
        </Button>
      </div>
    </>
  );
}
