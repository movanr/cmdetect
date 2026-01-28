import { useEffect } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
  const { control, clearErrors, watch, setValue } = useFormContext<T>();

  const value = watch(name);

  // Clear value when field becomes disabled
  useEffect(() => {
    if (disabled && value != null) {
      setValue(name, null as any);
    }
  }, [disabled, value, name, setValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1", className)}>
          <div className="flex items-center justify-between gap-4">
            {label && (
              <FormLabel className="text-muted-foreground font-normal">{label}</FormLabel>
            )}
            <FormControl>
              <YesNoInput
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  // Clear error when user makes a selection
                  clearErrors(name);
                }}
                disabled={disabled}
                labels={labels}
              />
            </FormControl>
          </div>
          <FormMessage className="text-xs text-right" />
        </FormItem>
      )}
    />
  );
}
