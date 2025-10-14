/**
 * Reusable Status Filter Component
 */

import { Badge } from "@/components/ui/badge";
import { getTranslations } from "@/config/i18n";

interface StatusFilterProps<T extends string> {
  statuses: readonly T[];
  selectedStatuses: T[];
  onChange: (statuses: T[]) => void;
}

export function StatusFilter<T extends string>({
  statuses,
  selectedStatuses,
  onChange,
}: StatusFilterProps<T>) {
  const t = getTranslations();

  const toggleStatus = (status: T) => {
    if (selectedStatuses.includes(status)) {
      onChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onChange([...selectedStatuses, status]);
    }
  };

  const isActive = (status: T) => selectedStatuses.includes(status);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Filter:</span>
      {statuses.map((status) => (
        <Badge
          key={status}
          variant={isActive(status) ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => toggleStatus(status)}
        >
          {t.status[status as keyof typeof t.status]}
        </Badge>
      ))}
    </div>
  );
}
