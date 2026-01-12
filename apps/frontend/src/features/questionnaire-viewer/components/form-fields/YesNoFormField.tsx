/**
 * YesNoFormField - Radio group for Yes/No questions
 *
 * Uses shadcn RadioGroup with FormField Controller pattern.
 * Displays "Nein" first, then "Ja" to match original UX.
 */

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SQ_YES_NO_LABELS } from "@cmdetect/questionnaires";
import type { SQFormValues, SQQuestionKey } from "../../schema/sqZodSchemas";

interface YesNoFormFieldProps {
  /** The question ID (SQ1, SQ5, etc.) */
  name: SQQuestionKey;
  /** Whether the field is disabled */
  disabled?: boolean;
}

export function YesNoFormField({ name, disabled = false }: YesNoFormFieldProps) {
  const { control } = useFormContext<SQFormValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormControl>
            <RadioGroup
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              disabled={disabled}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id={`${name}-no`} />
                <Label
                  htmlFor={`${name}-no`}
                  className="cursor-pointer font-normal"
                >
                  {SQ_YES_NO_LABELS["no"]}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id={`${name}-yes`} />
                <Label
                  htmlFor={`${name}-yes`}
                  className="cursor-pointer font-normal"
                >
                  {SQ_YES_NO_LABELS["yes"]}
                </Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
