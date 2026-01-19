/**
 * Numeric Question Component (Days/number input)
 * Shows numeric input with min/max validation
 * Requires explicit "Weiter" button click
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { GenericQuestion } from "../../types";

type NumericQuestionProps = {
  question: GenericQuestion;
  onNavigateNext: () => void;
};

export function NumericQuestion({ question, onNavigateNext }: NumericQuestionProps) {
  const { control, watch } = useFormContext<Record<string, unknown>>();
  const [error, setError] = useState<string | null>(null);
  const currentValue = watch(question.id);

  const range = question.range ?? { min: 0, max: 999 };

  const handleNext = () => {
    const value = Number(currentValue);

    if (currentValue === undefined || currentValue === "" || currentValue === null) {
      setError("Bitte geben Sie eine Zahl ein");
      return;
    }

    if (isNaN(value) || value < range.min || value > range.max) {
      setError(`Bitte geben Sie einen Wert zwischen ${range.min} und ${range.max} ein`);
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
      {question.note && <p className="text-sm text-muted-foreground italic">{question.note}</p>}

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
                min={range.min}
                max={range.max}
                value={(field.value as string | number | undefined) ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : Number(e.target.value);
                  field.onChange(val);
                  setError(null);
                }}
                placeholder="0"
                className="text-2xl text-center w-24 h-14"
              />
              {question.unit && (
                <span className="text-lg text-muted-foreground">{question.unit}</span>
              )}
            </div>
          )}
        />

        <p className="text-sm text-muted-foreground">
          Geben Sie einen Wert zwischen {range.min} und {range.max} ein
        </p>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Next button */}
      <Button type="button" onClick={handleNext} className="w-full h-12">
        Weiter
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
