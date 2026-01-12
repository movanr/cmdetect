/**
 * DurationFormField - Composite input for years and months
 *
 * Uses shadcn Input with FormField Controller pattern.
 * Validates years >= 0 and months 0-11.
 */

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SQ_DURATION_LABELS } from "@cmdetect/questionnaires";
import type { SQFormValues, DurationValue } from "../../schema/sqZodSchemas";

interface DurationFormFieldProps {
  /** The question ID (SQ2 or SQ6) */
  name: "SQ2" | "SQ6";
  /** Whether the field is disabled */
  disabled?: boolean;
}

export function DurationFormField({
  name,
  disabled = false,
}: DurationFormFieldProps) {
  const { control } = useFormContext<SQFormValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as DurationValue | undefined) ?? {
          years: 0,
          months: 0,
        };

        const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const years = parseInt(e.target.value, 10);
          field.onChange({
            ...value,
            years: isNaN(years) ? 0 : Math.max(0, years),
          });
        };

        const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const months = parseInt(e.target.value, 10);
          field.onChange({
            ...value,
            months: isNaN(months) ? 0 : Math.max(0, Math.min(11, months)),
          });
        };

        return (
          <FormItem className="space-y-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={value.years ?? 0}
                    onChange={handleYearsChange}
                    disabled={disabled}
                    className="w-20"
                  />
                </FormControl>
                <Label className="text-sm text-muted-foreground font-normal">
                  {SQ_DURATION_LABELS.years}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={11}
                  value={value.months ?? 0}
                  onChange={handleMonthsChange}
                  disabled={disabled}
                  className="w-20"
                />
                <Label className="text-sm text-muted-foreground font-normal">
                  {SQ_DURATION_LABELS.months}
                </Label>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
