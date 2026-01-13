/**
 * Scale Question Component (0-10 horizontal buttons)
 * Shows 11 buttons in a row with endpoint labels below
 * Requires explicit Next button click to proceed
 *
 * Generic component that works with any questionnaire using 0-10 scales
 */

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

/**
 * Generic scale question interface
 * Compatible with GCPS1MScaleQuestion, JFLS8Question, etc.
 */
type GenericScaleQuestion = {
  id: string;
  type: "scale_0_10";
  text: string;
  scaleLabels: {
    min: string;
    max: string;
  };
};

type ScaleQuestionProps = {
  question: GenericScaleQuestion;
  onNavigateNext: () => void;
};

export function ScaleQuestion({ question, onNavigateNext }: ScaleQuestionProps) {
  const { setValue, watch } = useFormContext<Record<string, string | number | undefined>>();
  const currentValue = watch(question.id);

  const handleSelect = (value: string) => {
    setValue(question.id, value);
  };

  const handleNext = () => {
    if (currentValue !== undefined) {
      onNavigateNext();
    }
  };

  // Generate 0-10 options
  const options = Array.from({ length: 11 }, (_, i) => String(i));

  return (
    <div className="space-y-6">
      {/* Question text */}
      <p className="text-lg font-medium leading-relaxed">{question.text}</p>

      {/* 0-10 horizontal button row */}
      <div className="flex gap-1 sm:gap-2 justify-between">
        {options.map((value) => (
          <Button
            key={value}
            type="button"
            variant={currentValue === value ? "default" : "outline"}
            className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-medium p-0 min-w-0"
            onClick={() => handleSelect(value)}
          >
            {value}
          </Button>
        ))}
      </div>

      {/* Scale endpoint labels below buttons with connecting lines */}
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

      {/* Next button */}
      <Button
        type="button"
        onClick={handleNext}
        disabled={currentValue === undefined}
        className="w-full h-12"
      >
        Weiter
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
