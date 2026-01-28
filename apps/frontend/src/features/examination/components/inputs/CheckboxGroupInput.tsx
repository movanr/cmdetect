import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
}

/**
 * Controlled checkbox group input for multi-select options.
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
          ? "flex flex-wrap gap-4"
          : "flex flex-col gap-2",
        className
      )}
    >
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2">
          <Checkbox
            id={getId(option)}
            checked={value.includes(option)}
            onCheckedChange={(checked) => handleToggle(option, checked === true)}
            disabled={disabled}
          />
          <Label htmlFor={getId(option)} className="text-sm font-normal cursor-pointer">
            {getLabel(option)}
          </Label>
        </div>
      ))}
    </div>
  );
}
