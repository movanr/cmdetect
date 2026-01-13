/**
 * Numeric Question Component (Days input)
 * Shows numeric input with min/max validation
 * Requires explicit "Weiter" button click
 */

import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { GCPS1MAnswers, GCPS1MNumericQuestion } from "@cmdetect/questionnaires";

type NumericQuestionProps = {
  question: GCPS1MNumericQuestion;
  onNavigateNext: () => void;
};

export function NumericQuestion({
  question,
  onNavigateNext,
}: NumericQuestionProps) {
  const { control, watch } = useFormContext<GCPS1MAnswers>();
  const [error, setError] = useState<string | null>(null);
  const currentValue = watch(question.id);

  const handleNext = () => {
    const value = Number(currentValue);

    if (currentValue === undefined || currentValue === "") {
      setError("Bitte geben Sie eine Zahl ein");
      return;
    }

    if (isNaN(value) || value < question.range.min || value > question.range.max) {
      setError(
        `Bitte geben Sie einen Wert zwischen ${question.range.min} und ${question.range.max} ein`
      );
      return;
    }

    setError(null);
    onNavigateNext();
  };

  return (
    <div className="space-y-6">
      {/* Question text */}
      <p className="text-lg font-medium leading-relaxed">{question.text}</p>

      {/* Note if present */}
      {question.note && (
        <p className="text-sm text-muted-foreground italic">{question.note}</p>
      )}

      {/* Numeric input */}
      <div className="space-y-2">
        <Controller
          name={question.id}
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-4">
              <Input
                type="number"
                inputMode="numeric"
                min={question.range.min}
                max={question.range.max}
                value={field.value ?? ""}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  field.onChange(val);
                  setError(null);
                }}
                placeholder="0"
                className="text-2xl text-center w-24 h-14"
              />
              <span className="text-lg text-muted-foreground">
                {question.unit}
              </span>
            </div>
          )}
        />

        <p className="text-sm text-muted-foreground">
          Geben Sie einen Wert zwischen {question.range.min} und{" "}
          {question.range.max} ein
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Next button (required for numeric input) */}
      <Button type="button" onClick={handleNext} className="w-full h-12">
        Weiter
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
