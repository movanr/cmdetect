/**
 * Behandler (Examiner) Selector
 *
 * Dropdown to select which physician is performing the examination.
 * Must be explicitly selected — no auto-selection.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTranslations } from "@/config/i18n";
import { usePhysicians } from "../hooks/use-physicians";

interface BehandlerSelectorProps {
  value: string | null;
  onChange: (physicianId: string) => void;
  disabled?: boolean;
}

export function BehandlerSelector({ value, onChange, disabled }: BehandlerSelectorProps) {
  const { data: physicians, isLoading } = usePhysicians();
  const t = getTranslations();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {t.examination.behandlerLabel}:
      </label>
      <Select
        value={value ?? undefined}
        onValueChange={onChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-[200px] h-8 text-sm">
          <SelectValue placeholder={t.examination.selectBehandler} />
        </SelectTrigger>
        <SelectContent>
          {physicians?.map((physician) => (
            <SelectItem key={physician.id} value={physician.id}>
              {physician.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
