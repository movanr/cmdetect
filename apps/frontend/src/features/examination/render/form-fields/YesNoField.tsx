/**
 * YesNoField - Radio group for Yes/No examination questions
 *
 * Uses shadcn RadioGroup with FormField Controller pattern.
 * Displays "Nein" first, then "Ja" to match clinical convention.
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
import { YES_NO_LABELS } from "../../content/options";

interface YesNoFieldProps {
  /** The field name (instanceId from the question) */
  name: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
}

export function YesNoField({
  name,
  disabled = false,
  className,
}: YesNoFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <RadioGroup
              value={field.value ?? ""}
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
                  {YES_NO_LABELS.no}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id={`${name}-yes`} />
                <Label
                  htmlFor={`${name}-yes`}
                  className="cursor-pointer font-normal"
                >
                  {YES_NO_LABELS.yes}
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
