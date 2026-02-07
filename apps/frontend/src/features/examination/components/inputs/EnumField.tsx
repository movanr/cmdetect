import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { EnumInput } from "./EnumInput";
import { cn } from "@/lib/utils";

interface EnumFieldProps<T extends FieldValues, TOption extends string> {
  name: FieldPath<T>;
  options: readonly TOption[];
  label?: string;
  labels?: Record<TOption, string>;
  disabled?: boolean;
  className?: string;
  /** Layout direction for options */
  direction?: "horizontal" | "vertical";
}

export function EnumField<T extends FieldValues, TOption extends string>({
  name,
  options,
  label,
  labels,
  disabled,
  className,
  direction,
}: EnumFieldProps<T, TOption>) {
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
            <EnumInput
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                clearErrors(name);
              }}
              options={options}
              labels={labels}
              disabled={disabled}
              direction={direction}
              hasError={!!fieldState.error}
              name={name}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
