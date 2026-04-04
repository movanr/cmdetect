/**
 * Clinician Determination — clinical classification input + optional note.
 * EU MDR compliance: the clinician records their own determination, not the software.
 *
 * Instruments with validated cutpoints (GCPS, PHQ-4) get a dropdown for classification.
 * Instruments without established norms (JFLS, OBC, Pain Drawing) get a free-text input.
 * All instruments get a separate optional note field.
 */

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DeterminationOption {
  value: string;
  label: string;
}

interface ClinicianDeterminationProps {
  /** Dropdown options — omit for free-text classification (instruments without validated norms) */
  options?: DeterminationOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  /** Free-text classification — used when no dropdown options are provided */
  freeText?: string;
  onFreeTextChange?: (text: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
}

export function ClinicianDetermination({
  options,
  value,
  onValueChange,
  freeText,
  onFreeTextChange,
  note,
  onNoteChange,
}: ClinicianDeterminationProps) {
  const hasDropdown = options && options.length > 0 && onValueChange;

  return (
    <div className="border-t px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">Klinische Einordnung</p>
      <div className="flex items-center gap-2">
        {hasDropdown ? (
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger size="sm" className="w-[160px]">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={freeText ?? ""}
            onChange={(e) => onFreeTextChange?.(e.target.value)}
            placeholder="Einordnung eingeben"
            className="h-8 text-sm w-[200px]"
          />
        )}
        <Input
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Anmerkung (optional)"
          className="h-8 text-sm flex-1"
        />
      </div>
    </div>
  );
}
