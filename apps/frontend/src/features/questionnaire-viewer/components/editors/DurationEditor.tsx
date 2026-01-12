/**
 * Duration editor with years and months inputs
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DurationValue {
  years?: number;
  months?: number;
}

interface DurationEditorProps {
  value: DurationValue;
  onChange: (value: DurationValue) => void;
}

export function DurationEditor({ value, onChange }: DurationEditorProps) {
  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const years = parseInt(e.target.value, 10);
    onChange({
      ...value,
      years: isNaN(years) ? 0 : Math.max(0, years),
    });
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const months = parseInt(e.target.value, 10);
    onChange({
      ...value,
      months: isNaN(months) ? 0 : Math.max(0, Math.min(11, months)),
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          value={value.years ?? 0}
          onChange={handleYearsChange}
          className="w-20"
        />
        <Label className="text-sm text-muted-foreground">Jahre</Label>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={11}
          value={value.months ?? 0}
          onChange={handleMonthsChange}
          className="w-20"
        />
        <Label className="text-sm text-muted-foreground">Monate</Label>
      </div>
    </div>
  );
}
