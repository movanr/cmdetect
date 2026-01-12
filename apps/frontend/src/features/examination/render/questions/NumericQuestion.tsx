import { Input } from "@/components/ui/input";
import { Controller, useFormContext } from "react-hook-form";
import { currentLang, t } from "../../model/localisation";
import type { QuestionNumeric } from "../../model/question";
import { UNITS } from "../../model/units";
import { QuestionField } from "../QuestionField";

export function NumericQuestion({ question }: { question: QuestionNumeric }) {
  const { control } = useFormContext();

  const id = question.id;
  const label = t(question.label, currentLang);
  const description = question.description ? t(question.description, currentLang) : undefined;
  const unitLabel = question.unit ? t(UNITS[question.unit].label, currentLang) : undefined;
  console.log("FIELD", id);

  return (
    <Controller
      name={id}
      control={control}
      render={({ field, fieldState }) => (
        <QuestionField
          id={id}
          label={label}
          description={description}
          error={fieldState.error?.message}
        >
          <div className={question.unit ? "relative" : undefined}>
            <Input
              id={id}
              type="number"
              min={question.min}
              max={question.max}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(e.target.value === "" ? null : Number(e.target.value))
              }
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.error ? `${id}-error` : description ? `${id}-description` : undefined
              }
              className={question.unit ? "pr-12" : undefined}
            />
            {question.unit && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-sm text-muted-foreground">{unitLabel}</span>
              </div>
            )}
          </div>
        </QuestionField>
      )}
    />
  );
}
