import { Controller, useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { YesNoInput } from "./YesNoInput";
import { cn } from "@/lib/utils";

interface YesNoFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  labels?: { yes: string; no: string };
  disabled?: boolean;
  className?: string;
}

export function YesNoField<T extends FieldValues>({
  name,
  label,
  labels,
  disabled,
  className,
}: YesNoFieldProps<T>) {
  const { control, getFieldState, formState } = useFormContext<T>();
  // Pass formState to getFieldState to subscribe to updates
  const { error } = getFieldState(name, formState);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <YesNoInput
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            labels={labels}
          />
        )}
      />
      {error && (
        <span className="text-xs text-destructive">{error.message}</span>
      )}
    </div>
  );
}
