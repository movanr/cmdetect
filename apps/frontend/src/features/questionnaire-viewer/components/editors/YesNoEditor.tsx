/**
 * Yes/No answer editor with radio buttons
 */

interface YesNoEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function YesNoEditor({ value, onChange }: YesNoEditorProps) {
  return (
    <div className="flex gap-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="yesno"
          checked={value === "yes"}
          onChange={() => onChange("yes")}
          className="w-4 h-4 text-primary"
        />
        <span>Ja</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="radio"
          name="yesno"
          checked={value === "no"}
          onChange={() => onChange("no")}
          className="w-4 h-4 text-primary"
        />
        <span>Nein</span>
      </label>
    </div>
  );
}
