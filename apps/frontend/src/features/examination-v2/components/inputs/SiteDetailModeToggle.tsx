import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  SITE_DETAIL_MODES,
  SITE_DETAIL_MODE_KEYS,
  type SiteDetailMode,
} from "../../model/regions";

interface SiteDetailModeToggleProps {
  value: SiteDetailMode;
  onChange: (mode: SiteDetailMode) => void;
}

export function SiteDetailModeToggle({ value, onChange }: SiteDetailModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        // Only call onChange if a value is selected (prevents deselection)
        if (v) onChange(v as SiteDetailMode);
      }}
      variant="outline"
      size="sm"
    >
      {SITE_DETAIL_MODE_KEYS.map((key) => (
        <ToggleGroupItem key={key} value={key} className="text-xs">
          {SITE_DETAIL_MODES[key]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
