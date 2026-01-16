/**
 * MeasurementField - Numeric input for measurements (e.g., jaw opening in mm)
 *
 * Features:
 * - Displays unit suffix (default: mm)
 * - Supports min/max constraints
 * - Nullable (can be cleared)
 * - Optional label display
 */

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/**
 * Inner input component that can access form field state via useFormField.
 */
function MeasurementInput({
  value,
  onChange,
  min,
  max,
  disabled,
  unit,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  disabled: boolean;
  unit: string;
}) {
  const { error } = useFormField();

  return (
    <div className="relative w-24">
      <Input
        type="number"
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "" ? null : Number(val));
        }}
        disabled={disabled}
        aria-invalid={!!error}
        className="pr-10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}

interface MeasurementFieldProps {
  /** The field name (instanceId from the question) */
  name: string;
  /** Label to display above the input */
  label?: string;
  /** Unit suffix to display (default: mm) */
  unit?: string;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
}

export function MeasurementField({
  name,
  label,
  unit = "mm",
  min,
  max,
  disabled = false,
  className,
}: MeasurementFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <MeasurementInput
              value={field.value}
              onChange={field.onChange}
              min={min}
              max={max}
              disabled={disabled}
              unit={unit}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
