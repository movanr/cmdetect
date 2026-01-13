/**
 * Choice Question Component
 * Shows vertically stacked option buttons
 * Auto-navigates on selection (like PHQ-4)
 */

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { ScoredOption } from "@cmdetect/questionnaires";
import type { GenericQuestion } from "../../types";

type ChoiceQuestionProps = {
  question: GenericQuestion;
  options: readonly ScoredOption[];
  instruction?: string;
  onNavigateNext: () => void;
};

export function ChoiceQuestion({
  question,
  options,
  instruction,
  onNavigateNext,
}: ChoiceQuestionProps) {
  const { setValue } = useFormContext<Record<string, string>>();

  const handleSelect = (value: string) => {
    setValue(question.id, value);
    onNavigateNext();
  };

  return (
    <div className="space-y-6">
      {/* Instruction if provided */}
      {instruction && (
        <p className="text-base text-muted-foreground leading-relaxed">
          {instruction}
        </p>
      )}

      {/* Question text */}
      <p className="text-lg font-medium leading-relaxed">{question.text}</p>

      {/* Options - vertically stacked */}
      <div className="flex flex-col gap-3">
        {options.map((option) => (
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
