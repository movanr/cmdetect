/**
 * PHQ-4 Question Screen
 * Shows instruction, question text, and 4 vertically stacked option buttons
 */

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { PHQ4Question, PHQ4Option } from "../model/question";
import type { PHQ4Answers } from "../model/answer";
import { PHQ4_QUESTIONNAIRE } from "../data/phq4Questions";

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
        {options.map((option: PHQ4Option) => (
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
