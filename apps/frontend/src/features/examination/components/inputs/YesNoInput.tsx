import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type YesNoValue = "yes" | "no" | null;

interface YesNoInputProps {
  value: YesNoValue;
  onChange: (value: YesNoValue) => void;
  disabled?: boolean;
  labels?: { yes: string; no: string };
  className?: string;
}

export function YesNoInput({
  value,
  onChange,
  disabled = false,
  labels = { yes: "Ja", no: "Nein" },
  className,
}: YesNoInputProps) {
  return (
    <ToggleGroup
      type="single"
      value={value ?? ""}
      onValueChange={(val) => onChange((val as YesNoValue) || null)}
      disabled={disabled}
      variant="outline"
      className={cn("gap-1", className)}
      spacing={1}
    >
      <ToggleGroupItem
        value="no"
        className="rounded-full px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        {labels.no}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="yes"
        className="rounded-full px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        {labels.yes}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
