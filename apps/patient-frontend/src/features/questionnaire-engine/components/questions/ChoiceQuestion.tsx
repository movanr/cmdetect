/**
 * Choice Question Component
 * Shows vertically stacked option buttons
 * Auto-navigates on selection with brief animation feedback
 */

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
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
  const { setValue, watch } = useFormContext<Record<string, string | undefined>>();
  const selectedValue = watch(question.id);

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
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "w-full h-12 text-base font-medium text-left px-4 rounded-md border transition-all duration-150",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2"
                  : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
