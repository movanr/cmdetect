import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export interface CheckboxGroupInputProps<T extends string> {
  value: T[];
  onChange: (value: T[]) => void;
  options: readonly T[];
  labels?: Record<T, string>;
  disabled?: boolean;
  className?: string;
  /** Layout direction: horizontal or vertical (default) */
  direction?: "horizontal" | "vertical";
  /** Unique name/id prefix to distinguish multiple instances with same options */
  name?: string;
  /** Show error state (red border) */
  hasError?: boolean;
}

/**
 * Controlled checkbox group input with button-like styling.
 */
export function CheckboxGroupInput<T extends string>({
  value,
  onChange,
  options,
  labels,
  disabled,
  className,
  direction = "vertical",
  name,
  hasError,
}: CheckboxGroupInputProps<T>) {
  const getLabel = (option: T): string => labels?.[option] ?? option;
  const getId = (option: T): string => (name ? `${name}-${option}` : option);

  const handleToggle = (option: T, checked: boolean) => {
    if (checked) {
      // Handle "none" option: if selecting "none", clear all others
      if (option === "none") {
        onChange([option]);
      } else {
        // If selecting something else, remove "none" from selection
        const filtered = value.filter((v) => v !== "none");
        onChange([...filtered, option]);
      }
    } else {
      onChange(value.filter((v) => v !== option));
    }
  };

  return (
    <div
      className={cn(
        direction === "horizontal"
          ? "flex flex-wrap gap-2"
          : "flex flex-col gap-2",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value.includes(option);
        return (
          <label
            key={option}
            htmlFor={getId(option)}
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
            <Checkbox
              id={getId(option)}
              checked={isSelected}
              onCheckedChange={(checked) => handleToggle(option, checked === true)}
              disabled={disabled}
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <span className="text-sm font-normal">{getLabel(option)}</span>
          </label>
        );
      })}
    </div>
  );
}
