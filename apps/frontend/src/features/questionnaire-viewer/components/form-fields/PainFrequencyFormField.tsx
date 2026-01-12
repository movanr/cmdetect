/**
 * PainFrequencyFormField - Dropdown select for SQ3 pain frequency
 *
 * Uses shadcn Select with FormField Controller pattern.
 * Options: Keine Schmerzen, Schmerzen kommen und gehen, Schmerzen sind ständig vorhanden
 */

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SQ_PAIN_FREQUENCY_OPTIONS } from "@cmdetect/questionnaires";
import type { SQFormValues } from "../../schema/sqZodSchemas";

interface PainFrequencyFormFieldProps {
  /** Whether the field is disabled */
  disabled?: boolean;
}

export function PainFrequencyFormField({
  disabled = false,
}: PainFrequencyFormFieldProps) {
  const { control } = useFormContext<SQFormValues>();

  return (
    <FormField
      control={control}
      name="SQ3"
      render={({ field }) => (
        <FormItem className="space-y-0">
          <FormControl>
            <Select
              value={field.value as string | undefined}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Bitte auswählen" />
              </SelectTrigger>
              <SelectContent>
                {SQ_PAIN_FREQUENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
