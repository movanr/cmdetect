import { useFormContext, useWatch } from "react-hook-form";
import { useFormSheet } from "../use-form-sheet";

interface FsCheckboxGroupProps {
  name: string;
  options: readonly { key: string; label: string }[];
}

export function FsCheckboxGroup({ name, options }: FsCheckboxGroupProps) {
  const { setValue } = useFormContext();
  const { readOnly } = useFormSheet();
  const value: string[] = (useWatch({ name }) as string[]) ?? [];

  const toggle = (key: string) => {
    if (readOnly) return;
    if (value.includes(key)) {
      setValue(name, value.filter((v) => v !== key), { shouldDirty: true });
    } else if (key === "none") {
      setValue(name, ["none"], { shouldDirty: true });
    } else {
      setValue(name, [...value.filter((v) => v !== "none"), key], { shouldDirty: true });
    }
  };

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
      {options.map(({ key, label }) => {
        const checked = value.includes(key);
        return (
          <button
            type="button"
            key={key}
            onClick={() => toggle(key)}
            disabled={readOnly}
            className={`inline-flex items-center gap-1 select-none group ${readOnly ? "cursor-default" : "cursor-pointer"}`}
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
      })}
    </div>
  );
}
