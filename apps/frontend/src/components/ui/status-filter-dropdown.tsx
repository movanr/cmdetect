/**
 * Reusable Status Filter Dropdown Component with Single-Choice
 */

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { getTranslations } from "@/config/i18n";

interface StatusFilterDropdownProps<T extends string> {
  statuses: readonly T[];
  selectedStatus: T | "all";
  onChange: (status: T | "all") => void;
  label?: string;
}

export function StatusFilterDropdown<T extends string>({
  statuses,
  selectedStatus,
  onChange,
  label = "Alle",
}: StatusFilterDropdownProps<T>) {
  const t = getTranslations();

  const getDisplayLabel = () => {
    if (selectedStatus === "all") {
      return label;
    }
    return t.status[selectedStatus as keyof typeof t.status];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[140px] justify-between">
          <span>{getDisplayLabel()}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup
          value={selectedStatus}
          onValueChange={(value) => onChange(value as T | "all")}
        >
          <DropdownMenuRadioItem value="all">{label}</DropdownMenuRadioItem>
          {statuses.map((status) => (
            <DropdownMenuRadioItem key={status} value={status}>
              {t.status[status as keyof typeof t.status]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
