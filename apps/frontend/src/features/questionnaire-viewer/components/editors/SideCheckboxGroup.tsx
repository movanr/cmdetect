/**
 * Side checkbox group for Office use (R/L/DNK)
 * R and L can be selected together (bilateral)
 * DNK is mutually exclusive with R/L
 */

import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface OfficeUseValue {
  R?: boolean;
  L?: boolean;
  DNK?: boolean;
}

interface SideCheckboxGroupProps {
  value: OfficeUseValue;
  onChange: (value: OfficeUseValue) => void;
  disabled?: boolean;
  error?: boolean;
}

export function SideCheckboxGroup({
  value,
  onChange,
  disabled = false,
  error = false,
}: SideCheckboxGroupProps) {
  const id = useId();
  const handleRChange = (checked: boolean) => {
    if (checked) {
      // Selecting R clears DNK
      onChange({ ...value, R: true, DNK: false });
    } else {
      onChange({ ...value, R: false });
    }
  };

  const handleLChange = (checked: boolean) => {
    if (checked) {
      // Selecting L clears DNK
      onChange({ ...value, L: true, DNK: false });
    } else {
      onChange({ ...value, L: false });
    }
  };

  const handleDNKChange = (checked: boolean) => {
    if (checked) {
      // Selecting DNK clears R and L
      onChange({ R: false, L: false, DNK: true });
    } else {
      onChange({ ...value, DNK: false });
    }
  };

  const labelClass = error
    ? "text-sm font-normal cursor-pointer text-destructive"
    : "text-sm font-normal cursor-pointer";

  const labelClassMuted = error
    ? "text-sm font-normal cursor-pointer text-destructive"
    : "text-sm font-normal cursor-pointer text-muted-foreground";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground mr-1">Seite:</span>
      <div className="flex items-center gap-1.5">
        <Checkbox
          id={`${id}-R`}
          checked={value.R ?? false}
          onCheckedChange={(checked) => handleRChange(checked === true)}
          disabled={disabled}
          aria-invalid={error}
        />
        <Label htmlFor={`${id}-R`} className={labelClass}>
          Rechts
        </Label>
      </div>
      <div className="flex items-center gap-1.5">
        <Checkbox
          id={`${id}-L`}
          checked={value.L ?? false}
          onCheckedChange={(checked) => handleLChange(checked === true)}
          disabled={disabled}
          aria-invalid={error}
        />
        <Label htmlFor={`${id}-L`} className={labelClass}>
          Links
        </Label>
      </div>
      <div className="flex items-center gap-1.5">
        <Checkbox
          id={`${id}-DNK`}
          checked={value.DNK ?? false}
          onCheckedChange={(checked) => handleDNKChange(checked === true)}
          disabled={disabled}
          aria-invalid={error}
        />
        <Label htmlFor={`${id}-DNK`} className={labelClassMuted}>
          Unklar
        </Label>
      </div>
    </div>
  );
}
