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
}: EnumInputProps<T>) {
  const getLabel = (option: T): string => labels?.[option] ?? option;

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
            htmlFor={option}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md border cursor-pointer transition-colors",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-input hover:bg-accent hover:border-accent-foreground/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <RadioGroupItem value={option} id={option} />
            <span className="text-sm font-normal">{getLabel(option)}</span>
          </Label>
        );
      })}
    </RadioGroup>
  );
}
