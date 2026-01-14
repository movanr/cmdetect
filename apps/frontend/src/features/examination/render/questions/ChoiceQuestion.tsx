import { Controller, useFormContext } from "react-hook-form";
import { currentLang, t } from "../../model/localisation";
import type { QuestionChoice } from "../../model/question";
import { QuestionField } from "../QuestionField";

export function ChoiceQuestion({ question }: { question: QuestionChoice }) {
  const { control } = useFormContext();

  const id = question.id;
  const label = t(question.label, currentLang);
  const description = question.description ? t(question.description, currentLang) : undefined;
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
          <div className="space-y-2">
            {question.answerOptions.map((option) => {
              const optionLabel = t(option.label, currentLang);
              const inputId = `${id}-${option.id}`;

              if (question.multiple) {
                // Multiple choice - checkboxes
                const isChecked = Array.isArray(field.value) && field.value.includes(option.id);

                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={inputId}
                      checked={isChecked}
                      onChange={(e) => {
                        const currentValue = Array.isArray(field.value) ? field.value : [];
                        if (e.target.checked) {
                          field.onChange([...currentValue, option.id]);
                        } else {
                          field.onChange(currentValue.filter((value) => value !== option.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                      aria-invalid={fieldState.invalid}
                    />
                    <label
                      htmlFor={inputId}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {optionLabel}
                    </label>
                  </div>
                );
              } else {
                // Single choice - radio buttons
                const isChecked = field.value === option.id;

                return (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={inputId}
                      name={id}
                      value={option.id}
                      checked={isChecked}
                      onChange={() => field.onChange(option.id)}
                      className="h-4 w-4 border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2"
                      aria-invalid={fieldState.invalid}
                    />
                    <label
                      htmlFor={inputId}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {optionLabel}
                    </label>
                  </div>
                );
              }
            })}
          </div>
        </QuestionField>
      )}
    />
  );
}
