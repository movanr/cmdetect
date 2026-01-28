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
  /** Layout direction: horizontal (default) or vertical */
  direction?: "horizontal" | "vertical";
}

/**
 * Controlled enum input component that renders as radio buttons.
 */
export function EnumInput<T extends string>({
  value,
  onChange,
  options,
  labels,
  disabled,
  className,
  direction = "horizontal",
}: EnumInputProps<T>) {
  const getLabel = (option: T): string => labels?.[option] ?? option;

  return (
    <RadioGroup
      value={value ?? ""}
      onValueChange={(val) => onChange(val as T)}
      disabled={disabled}
      className={cn(
        direction === "horizontal"
          ? "flex flex-wrap gap-4"
          : "flex flex-col gap-2",
        className
      )}
    >
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2">
          <RadioGroupItem value={option} id={option} />
          <Label htmlFor={option} className="text-sm font-normal cursor-pointer">
            {getLabel(option)}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
