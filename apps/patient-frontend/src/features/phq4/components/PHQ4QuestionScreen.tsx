/**
 * PHQ-4 Question Screen
 * Shows instruction, question text, and 4 vertically stacked option buttons
 */

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  PHQ4_QUESTIONNAIRE,
  type PHQ4Question,
  type PHQ4Answers,
  type ScoredOption,
} from "@cmdetect/questionnaires";

type PHQ4QuestionScreenProps = {
  question: PHQ4Question;
  onNavigateNext: () => void;
};

export function PHQ4QuestionScreen({
  question,
  onNavigateNext,
}: PHQ4QuestionScreenProps) {
  const { setValue } = useFormContext<PHQ4Answers>();
  const options = PHQ4_QUESTIONNAIRE.options;

  const handleSelect = (value: string) => {
    setValue(question.id, value);
    onNavigateNext();
  };

  return (
    <div className="space-y-6">
      {/* Instruction - same for all questions */}
      <p className="text-base text-muted-foreground leading-relaxed">
        {PHQ4_QUESTIONNAIRE.instruction}
      </p>

      {/* Question text */}
      <p className="text-lg font-medium leading-relaxed">{question.text}</p>

      {/* Options - vertically stacked */}
      <div className="flex flex-col gap-3">
        {options.map((option: ScoredOption) => (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium justify-start px-4 active:bg-muted"
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
