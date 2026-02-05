import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { CheckboxGroupInput } from "./CheckboxGroupInput";
import { cn } from "@/lib/utils";

interface CheckboxGroupFieldProps<T extends FieldValues, TOption extends string> {
  name: FieldPath<T>;
  options: readonly TOption[];
  label?: string;
  labels?: Record<TOption, string>;
  disabled?: boolean;
  className?: string;
  /** Layout direction for options */
  direction?: "horizontal" | "vertical";
}

export function CheckboxGroupField<T extends FieldValues, TOption extends string>({
  name,
  options,
  label,
  labels,
  disabled,
  className,
  direction,
}: CheckboxGroupFieldProps<T, TOption>) {
  const { control, clearErrors } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn("space-y-2", className)}>
          {label && (
            <FormLabel className="text-muted-foreground font-normal">{label}</FormLabel>
          )}
          <FormControl>
            <CheckboxGroupInput
              value={field.value ?? []}
              onChange={(value) => {
                field.onChange(value);
                clearErrors(name);
              }}
              options={options}
              labels={labels}
              disabled={disabled}
              direction={direction}
              name={name}
              hasError={!!fieldState.error}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
