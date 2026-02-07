import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface EnumInputProps<T extends string> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly T[];
  labels?: Record<T, string>;
  disabled?: boolean;
  className?: string;
  /** Layout direction: horizontal or vertical (default) */
  direction?: "horizontal" | "vertical";
  /** Show error state (red border) */
  hasError?: boolean;
  /** Unique name to scope radio button ids (prevents collisions when multiple EnumInputs share option values) */
  name?: string;
}

/**
 * Controlled enum input component that renders as button-like radio options.
 */
export function EnumInput<T extends string>({
  value,
  onChange,
  options,
  labels,
  disabled,
  className,
  direction = "vertical",
  hasError,
  name,
}: EnumInputProps<T>) {
  const getLabel = (option: T): string => labels?.[option] ?? option;
  const getOptionId = (option: T): string => name ? `${name}-${option}` : option;

  return (
    <RadioGroup
      value={value ?? ""}
      onValueChange={(val) => onChange(val as T)}
      disabled={disabled}
      className={cn(
        direction === "horizontal"
          ? "flex flex-wrap gap-2"
          : "flex flex-col gap-2",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <Label
            key={option}
            htmlFor={getOptionId(option)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md border cursor-pointer transition-colors",
              isSelected
                ? "border-blue-500 bg-blue-500/5"
                : hasError
                  ? "border-destructive bg-destructive/5"
                  : "border-input hover:bg-accent hover:border-accent-foreground/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <RadioGroupItem
              value={option}
              id={getOptionId(option)}
              className="text-blue-500 [&_svg]:fill-blue-500"
            />
            <span className="text-sm font-normal">{getLabel(option)}</span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
