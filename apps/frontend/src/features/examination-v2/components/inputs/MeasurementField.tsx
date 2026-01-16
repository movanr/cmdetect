import { cn } from "@/lib/utils";
import { Controller, useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
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
  const { control, getFieldState, formState } = useFormContext<T>();
  const { error } = getFieldState(name, formState);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="flex flex-col items-end gap-1">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
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
              }}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        {error && <span className="text-xs text-destructive">{error.message}</span>}
      </div>
    </div>
  );
}
