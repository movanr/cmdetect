/**
 * Choice Question Component
 * Shows vertically stacked option buttons
 * Auto-navigates on selection with brief animation feedback
 */

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
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
  const { setValue } = useFormContext<Record<string, string>>();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // Reset selection state when question changes
  useEffect(() => {
    setSelectedValue(null);
  }, [question.id]);

  const handleSelect = (value: string) => {
    setValue(question.id, value);
    setSelectedValue(value);
    // Brief delay to show selection feedback before navigating
    setTimeout(() => {
      onNavigateNext();
    }, 350);
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
            <motion.button
              key={option.value}
              type="button"
              animate={isSelected ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.25 }}
              className={cn(
                "w-full h-12 text-base font-medium text-left px-4 rounded-md border transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
