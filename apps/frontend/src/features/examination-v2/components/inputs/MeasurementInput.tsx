import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MeasurementInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  unit?: string;
}

export const MeasurementInput = forwardRef<HTMLInputElement, MeasurementInputProps>(
  ({ unit = "mm", className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-xl border border-input bg-background shadow-xs",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed",
          className
        )}
      >
        <Input
          ref={ref}
          type="number"
          inputMode="numeric"
          className={cn(
            "w-16 border-0 bg-transparent shadow-none rounded-l-xl",
            "focus-visible:ring-0 focus-visible:border-0",
            "text-lg font-medium text-right pr-2",
            "[appearance:textfield]",
            "[&::-webkit-outer-spin-button]:appearance-none",
            "[&::-webkit-inner-spin-button]:appearance-none"
          )}
          {...props}
        />
        <span className="text-lg text-muted-foreground pr-4">{unit}</span>
      </div>
    );
  }
);

MeasurementInput.displayName = "MeasurementInput";
