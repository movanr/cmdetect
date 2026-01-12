/**
 * Single choice question component (Yes/No or multiple options)
 * Uses buttons that auto-navigate on selection
 */

import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import type { SQAnswers } from "../../model/answer";
import type { SingleChoiceQuestion as SingleChoiceQuestionType } from "../../model/question";

type SingleChoiceQuestionProps = {
  question: SingleChoiceQuestionType;
  onNavigateNext: (selectedValue: string) => void;
};

export function SingleChoiceQuestion({ question, onNavigateNext }: SingleChoiceQuestionProps) {
  const { setValue } = useFormContext<SQAnswers>();

  const handleSelect = (value: string) => {
    setValue(question.id, value);
    onNavigateNext(value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-lg font-medium leading-relaxed">{question.text}</p>
        {question.note && <p className="text-sm text-muted-foreground">{question.note}</p>}
      </div>

      <div className={question.options.length <= 2 ? "flex flex-row gap-4" : "flex flex-col gap-3"}>
        {question.options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            className={
              question.options.length <= 2
                ? "flex-1 h-14 text-lg font-medium active:bg-muted"
                : "w-full h-12 text-base font-medium justify-start px-4 active:bg-muted"
            }
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
