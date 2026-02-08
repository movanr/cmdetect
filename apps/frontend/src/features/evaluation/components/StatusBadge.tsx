import { Badge } from "@/components/ui/badge";
import type { CriterionStatus } from "@cmdetect/dc-tmd";

export const STATUS_CONFIG: Record<
  CriterionStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  positive: {
    label: "Positiv",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    dotClass: "bg-blue-500",
  },
  negative: {
    label: "Negativ",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    dotClass: "bg-gray-400",
  },
  pending: {
    label: "Ausstehend",
    badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dotClass: "border-2 border-yellow-500 bg-transparent",
  },
};

export function StatusBadge({ status }: { status: CriterionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.badgeClass}>
      {config.label}
    </Badge>
  );
}
