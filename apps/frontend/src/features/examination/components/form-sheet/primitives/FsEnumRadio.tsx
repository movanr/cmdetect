import { useFormContext } from "react-hook-form";
import { useFormSheet } from "../FormSheetContext";

interface FsEnumRadioProps {
  name: string;
  options: readonly { key: string; label: string }[];
}

export function FsEnumRadio({ name, options }: FsEnumRadioProps) {
  const { watch, setValue } = useFormContext();
  const { readOnly } = useFormSheet();
  const value: string | null = watch(name);

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
      {options.map(({ key, label }) => (
        <label
          key={key}
          className={`inline-flex items-center gap-1 ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        >
          <input
            type="radio"
            checked={value === key}
            onChange={() => {
              if (!readOnly) setValue(name, key, { shouldDirty: true });
            }}
            disabled={readOnly}
            className="accent-slate-700 w-3.5 h-3.5 print:w-2.5 print:h-2.5"
          />
          <span className="text-xs print:text-[7pt]">{label}</span>
        </label>
      ))}
    </div>
  );
}
