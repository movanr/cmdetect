/**
 * Composite number question component (Years + Months)
 * At least one field must be filled
 */

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompositeNumberQuestion as CompositeNumberQuestionType } from "../../model/question";
import type { SQAnswers, CompositeNumberAnswer } from "../../model/answer";

type CompositeNumberQuestionProps = {
  question: CompositeNumberQuestionType;
  error?: string;
};

export function CompositeNumberQuestion({
  question,
  error,
}: CompositeNumberQuestionProps) {
  const { control } = useFormContext<SQAnswers>();

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium leading-relaxed">{question.text}</p>

      <Controller
        name={question.id}
        control={control}
        render={({ field }) => {
          const value = (field.value as CompositeNumberAnswer) ?? {};

          const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const years = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
            field.onChange({ ...value, years });
          };

          const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const months = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
            field.onChange({ ...value, months });
          };

          return (
            <div className="flex gap-6">
              <div className="flex-1 space-y-2">
                <Label htmlFor={question.fields.years.id}>
                  {question.fields.years.label}
                </Label>
                <Input
                  id={question.fields.years.id}
                  type="number"
                  min={0}
                  max={99}
                  value={value.years ?? ""}
                  onChange={handleYearsChange}
                  placeholder="0"
                  className="text-lg"
                />
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor={question.fields.months.id}>
                  {question.fields.months.label}
                </Label>
                <Input
                  id={question.fields.months.id}
                  type="number"
                  min={0}
                  max={11}
                  value={value.months ?? ""}
                  onChange={handleMonthsChange}
                  placeholder="0"
                  className="text-lg"
                />
              </div>
            </div>
          );
        }}
      />

      <p className="text-sm text-muted-foreground">
        Enter years, months, or both
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
