/**
 * Status Badge Component for Patient Records
 */

import { Badge } from "@/components/ui/badge";
import type { CaseStatus, InviteStatus } from "../types";
import { getTranslations } from "@/config/i18n";

interface StatusBadgeProps {
  status: CaseStatus | InviteStatus;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function StatusBadge({
  status,
  variant = "secondary",
}: StatusBadgeProps) {
  const t = getTranslations();
  const getVariant = (status: CaseStatus | InviteStatus) => {
    switch (status) {
      case "pending":
        return "default";
      case "submitted":
        return "outline";
      case "new":
        return "default";
      case "viewed":
        return "outline";
      case "expired":
      case "consent_denied":
        return "destructive";
      default:
        return variant;
    }
  };

  return <Badge variant={getVariant(status)}>{t.status[status]}</Badge>;
}
