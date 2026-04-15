import { Input } from "@/components/ui/input";

interface ClinicalNoteProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClinicalNote({ value, onChange }: ClinicalNoteProps) {
  return (
    <div className="border-t px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Klinische Anmerkung (optional)
      </p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Anmerkung eingeben"
        className="h-8 text-sm"
      />
    </div>
  );
}
