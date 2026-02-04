import { Checkbox } from "@/components/ui/checkbox";
import { Controller, useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { COMMON } from "../../labels";

interface RefusalCheckboxProps<T extends FieldValues> {
  /** Form field name for the refused boolean */
  name: FieldPath<T>;
  /** Callback when refusal state changes (for clearing data) */
  onRefuseChange?: (refused: boolean) => void;
  /** Optional custom label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Checkbox for marking a step as refused (RF - Patient Refusal).
 * Used when a patient refuses to cooperate or is unable to participate.
 */
export function RefusalCheckbox<T extends FieldValues>({
  name,
  onRefuseChange,
  label = COMMON.refusedFull,
  className,
}: RefusalCheckboxProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={`flex items-center gap-2 ${className ?? ""}`}>
          <Checkbox
            id={name}
            checked={field.value === true}
            onCheckedChange={(checked) => {
              const isRefused = checked === true;
              field.onChange(isRefused);
              onRefuseChange?.(isRefused);
            }}
          />
          <label
            htmlFor={name}
            className="text-sm text-muted-foreground cursor-pointer select-none"
            title={COMMON.refusedTooltip}
          >
            {label}
          </label>
        </div>
      )}
    />
  );
}
