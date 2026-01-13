/**
 * OBC Question Screen
 * Shows question text and 5 vertically stacked option buttons (PHQ-4 style)
 * Options change based on current section (sleep vs waking)
 */

import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  OBC_SECTIONS,
  OBC_INSTRUCTIONS,
  type OBCQuestion,
  type OBCAnswers,
  type OBCSectionId,
} from "@cmdetect/questionnaires";

type OBCQuestionScreenProps = {
  question: OBCQuestion;
  sectionId: OBCSectionId;
  onNavigateNext: () => void;
};

export function OBCQuestionScreen({
  question,
  sectionId,
  onNavigateNext,
}: OBCQuestionScreenProps) {
  const { setValue } = useFormContext<OBCAnswers>();
  const section = OBC_SECTIONS[sectionId];
  const options = section.options;

  const handleSelect = (value: string) => {
    setValue(question.id, value);
    onNavigateNext();
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <p className="text-base text-muted-foreground leading-relaxed">
        {OBC_INSTRUCTIONS[0]}
      </p>

      {/* Question text */}
      <p className="text-lg font-medium leading-relaxed">{question.text}</p>

      {/* Options - vertically stacked (PHQ-4 style) */}
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
