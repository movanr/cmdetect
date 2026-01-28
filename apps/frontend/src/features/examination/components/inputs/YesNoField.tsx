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
  const { control, clearErrors } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex items-center justify-between gap-4", className)}>
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
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}
