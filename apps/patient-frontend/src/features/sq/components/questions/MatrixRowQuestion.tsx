/**
 * Matrix row question component
 * Shows one row from a matrix question with Yes/No buttons
 * Auto-navigates on selection
 */

import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import {
  SQ_YES_NO_LABELS,
  type SQAnswers,
  type SQMatrixRowQuestion,
} from "@cmdetect/questionnaires";

type MatrixRowQuestionProps = {
  question: SQMatrixRowQuestion;
  onNavigateNext: (selectedValue: string) => void;
};

export function MatrixRowQuestion({ question, onNavigateNext }: MatrixRowQuestionProps) {
  const { setValue } = useFormContext<SQAnswers>();

  const handleSelect = (value: string) => {
    setValue(question.id, value);
    onNavigateNext(value);
  };

  return (
    <div className="space-y-6">
      {/* Parent question context */}
      <p className="text-base text-muted-foreground leading-relaxed">{question.text}</p>

      {/* This row's specific text */}
      <p className="text-lg font-medium leading-relaxed">{question.rowText}</p>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-14 text-lg font-medium active:bg-muted"
          onClick={() => handleSelect("no")}
        >
          {SQ_YES_NO_LABELS.no}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-14 text-lg font-medium active:bg-muted"
          onClick={() => handleSelect("yes")}
        >
          {SQ_YES_NO_LABELS.yes}
        </Button>
      </div>
    </div>
  );
}
