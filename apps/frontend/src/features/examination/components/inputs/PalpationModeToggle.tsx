import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PALPATION_MODES,
  PALPATION_MODE_KEYS,
  type PalpationMode,
} from "../../model/regions";

interface PalpationModeToggleProps {
  value: PalpationMode;
  onChange: (mode: PalpationMode) => void;
}

export function PalpationModeToggle({ value, onChange }: PalpationModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        // Only call onChange if a value is selected (prevents deselection)
        if (v) onChange(v as PalpationMode);
      }}
      variant="outline"
      size="sm"
    >
      {PALPATION_MODE_KEYS.map((key) => (
        <ToggleGroupItem key={key} value={key} className="text-xs">
          {PALPATION_MODES[key]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
