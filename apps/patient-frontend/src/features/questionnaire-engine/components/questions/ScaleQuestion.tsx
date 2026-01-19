/**
 * Scale Question Component (0-10 horizontal buttons)
 * Shows 11 buttons in a row with endpoint labels below
 * Auto-advances after selection with brief animation feedback
 */

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { GenericQuestion } from "../../types";

type ScaleQuestionProps = {
  question: GenericQuestion;
  onNavigateNext: () => void;
};

export function ScaleQuestion({ question, onNavigateNext }: ScaleQuestionProps) {
  const { setValue, watch } = useFormContext<Record<string, string | number | undefined>>();
  const currentValue = watch(question.id);

  const handleSelect = (value: string) => {
    setValue(question.id, value);
    onNavigateNext();
  };

  // Generate 0-10 options
  const options = Array.from({ length: 11 }, (_, i) => String(i));

  return (
    <div className="space-y-6">
      {/* Question text */}
      <p className="text-lg font-medium leading-relaxed">{question.text}</p>

      {/* Note if present */}
      {question.note && (
        <p className="text-sm text-muted-foreground italic">{question.note}</p>
      )}

      {/* 0-10 horizontal button row */}
      <div className="flex gap-1 sm:gap-2 justify-between">
        {options.map((value) => {
          const isSelected = currentValue === value;
          return (
            <button
              key={value}
              type="button"
              className={cn(
                "flex-1 h-12 sm:h-14 text-base sm:text-lg font-medium min-w-0 rounded-md border transition-all duration-150",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-2"
                  : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleSelect(value)}
            >
              {value}
            </button>
          );
        })}
      </div>

      {/* Scale endpoint labels below buttons with connecting lines */}
      {question.scaleLabels && (
        <div className="flex gap-1 sm:gap-2 justify-between text-sm text-muted-foreground">
          {/* First label under 0 - line centered, text left-aligned */}
          <div className="flex-1 min-w-0 flex flex-col items-center">
            <div className="w-px h-3 bg-muted-foreground/50" />
            <span className="mt-1 self-start">{question.scaleLabels.min}</span>
          </div>
          {/* Empty spacers for buttons 1-9 */}
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="flex-1 min-w-0" />
          ))}
          {/* Last label under 10 - line centered, text right-aligned */}
          <div className="flex-1 min-w-0 flex flex-col items-center">
            <div className="w-px h-3 bg-muted-foreground/50" />
            <span className="mt-1 self-end text-right">{question.scaleLabels.max}</span>
          </div>
        </div>
      )}

      {/* Skip button for skippable questions (e.g., JFLS scales) */}
      {question.skippable && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onNavigateNext}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Frage auslassen
          </button>
        </div>
      )}
    </div>
  );
}
