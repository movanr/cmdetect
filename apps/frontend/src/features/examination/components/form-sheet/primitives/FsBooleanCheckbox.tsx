import { memo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useFormSheet } from "../use-form-sheet";

interface FsBooleanCheckboxProps {
  name: string;
  label: string;
  /** Optional callback fired after the value is written. Used to clear sibling fields. */
  onChange?: (next: boolean) => void;
  title?: string;
  className?: string;
}

export const FsBooleanCheckbox = memo(function FsBooleanCheckbox({
  name,
  label,
  onChange,
  title,
  className,
}: FsBooleanCheckboxProps) {
  const { setValue, control } = useFormContext();
  const { readOnly } = useFormSheet();
  const value = useWatch({ control, name }) as boolean | null | undefined;
  const checked = value === true;

  const toggle = () => {
    if (readOnly) return;
    const next = !checked;
    setValue(name, next, { shouldDirty: true });
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={readOnly}
      title={title}
      className={`inline-flex items-center gap-1 select-none group ${readOnly ? "cursor-default" : "cursor-pointer"} ${className ?? ""}`}
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center text-white text-xs font-bold transition-all print:w-3 print:h-3 print:text-[6pt] ${
          checked
            ? "bg-blue-600 border-blue-600"
            : "bg-white border-slate-300 group-hover:border-slate-400"
        }`}
      >
        {checked && "✓"}
      </span>
      <span className="text-xs text-slate-600 print:text-[7pt]">{label}</span>
    </button>
  );
});
