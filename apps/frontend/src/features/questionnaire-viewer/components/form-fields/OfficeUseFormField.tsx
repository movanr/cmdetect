/**
 * OfficeUseFormField - Checkbox group for R/L/DNK confirmation
 *
 * Uses shadcn Checkbox with FormField Controller pattern.
 * Implements mutual exclusivity: DNK clears R/L, R/L clears DNK.
 */

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { SQFormValues, SQOfficeUseKey, OfficeUseValue } from "../../schema/sqZodSchemas";

interface OfficeUseFormFieldProps {
  /** The office-use field key (SQ8_office, SQ9_office, etc.) */
  name: SQOfficeUseKey;
  /** Whether the field is disabled */
  disabled?: boolean;
}

export function OfficeUseFormField({
  name,
  disabled = false,
}: OfficeUseFormFieldProps) {
  const { control } = useFormContext<SQFormValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = (field.value as OfficeUseValue | undefined) ?? {};
        const hasError = !!fieldState.error;

        const handleRChange = (checked: boolean) => {
          if (checked) {
            // R selected: clear DNK
            field.onChange({ ...value, R: true, DNK: false });
          } else {
            field.onChange({ ...value, R: false });
          }
        };

        const handleLChange = (checked: boolean) => {
          if (checked) {
            // L selected: clear DNK
            field.onChange({ ...value, L: true, DNK: false });
          } else {
            field.onChange({ ...value, L: false });
          }
        };

        const handleDNKChange = (checked: boolean) => {
          if (checked) {
            // DNK selected: clear R and L
            field.onChange({ R: false, L: false, DNK: true });
          } else {
            field.onChange({ ...value, DNK: false });
          }
        };

        const labelClassName = hasError
          ? "text-sm font-normal cursor-pointer text-destructive"
          : "text-sm font-normal cursor-pointer";

        return (
          <FormItem className="space-y-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground mr-1">Seite:</span>
              <FormControl>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id={`${name}-R`}
                      checked={value.R ?? false}
                      onCheckedChange={(checked) =>
                        handleRChange(checked === true)
                      }
                      disabled={disabled}
                      aria-invalid={hasError}
                    />
                    <Label htmlFor={`${name}-R`} className={labelClassName}>
                      Rechts
                    </Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id={`${name}-L`}
                      checked={value.L ?? false}
                      onCheckedChange={(checked) =>
                        handleLChange(checked === true)
                      }
                      disabled={disabled}
                      aria-invalid={hasError}
                    />
                    <Label htmlFor={`${name}-L`} className={labelClassName}>
                      Links
                    </Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id={`${name}-DNK`}
                      checked={value.DNK ?? false}
                      onCheckedChange={(checked) =>
                        handleDNKChange(checked === true)
                      }
                      disabled={disabled}
                      aria-invalid={hasError}
                    />
                    <Label
                      htmlFor={`${name}-DNK`}
                      className={
                        hasError
                          ? labelClassName
                          : `${labelClassName} text-muted-foreground`
                      }
                    >
                      Unklar
                    </Label>
                  </div>
                </div>
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
