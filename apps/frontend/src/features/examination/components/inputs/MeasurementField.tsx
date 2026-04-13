import { cn } from "@/lib/utils";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { MeasurementInput } from "./MeasurementInput";

interface MeasurementFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  unit?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function MeasurementField<T extends FieldValues>({
  name,
  label,
  unit = "mm",
  min,
  max,
  disabled,
  className,
}: MeasurementFieldProps<T>) {
  const { control, clearErrors, setError } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col items-start gap-2", className)}>
          {label && <FormLabel className="font-medium">{label}</FormLabel>}
          <FormControl>
            <MeasurementInput
              unit={unit}
              min={min}
              max={max}
              disabled={disabled}
              // Convert null to empty string for display
              value={field.value ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                // Convert empty string to null, otherwise parse as number
                field.onChange(val === "" ? null : Number(val));
                // Clear error when user starts typing
                clearErrors(name);
              }}
              onBlur={() => {
                field.onBlur();
                const val = field.value;
                if (val != null && val !== "") {
                  const numVal = Number(val);
                  if (min !== undefined && numVal < min) {
                    setError(name, { type: "range", message: `Minimum: ${min}` });
                  } else if (max !== undefined && numVal > max) {
                    setError(name, { type: "range", message: `Maximum: ${max}` });
                  }
                }
              }}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
