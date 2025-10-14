/**
 * Reusable Search Field Component
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getTranslations } from "@/config/i18n";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChange, placeholder }: SearchFieldProps) {
  const t = getTranslations();
  const defaultPlaceholder = placeholder || t.search.searchByInternalId;

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={defaultPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {value && (
        <Button variant="ghost" size="sm" onClick={() => onChange("")}>
          {t.search.clear}
        </Button>
      )}
    </div>
  );
}
