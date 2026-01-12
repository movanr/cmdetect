/**
 * SQ3 pain pattern editor with dropdown
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SQ3EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SQ3_OPTIONS = [
  { value: "no_pain", label: "Keine Schmerzen" },
  { value: "intermittent", label: "Schmerzen kommen und gehen" },
  { value: "continuous", label: "Schmerzen sind ständig vorhanden" },
];

export function SQ3Editor({ value, onChange }: SQ3EditorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Bitte auswählen" />
      </SelectTrigger>
      <SelectContent>
        {SQ3_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
