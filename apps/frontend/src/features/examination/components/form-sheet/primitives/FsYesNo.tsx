import { useFormContext } from "react-hook-form";
import { useFormSheet } from "../use-form-sheet";

interface FsYesNoProps {
  name: string;
}

export function FsYesNo({ name }: FsYesNoProps) {
  const { watch, setValue } = useFormContext();
  const { readOnly } = useFormSheet();
  const value: "yes" | "no" | null = watch(name);

  const set = (v: "yes" | "no") => {
    if (readOnly) return;
    setValue(name, value === v ? null : v, { shouldDirty: true });
  };

  return (
    <span className="inline-flex gap-0.5">
      <button
        type="button"
        onClick={() => set("no")}
        disabled={readOnly}
        className={`w-5 h-5 rounded text-xs font-bold transition-all print:w-3.5 print:h-3.5 print:text-[6pt] ${
          value === "no"
            ? "bg-slate-700 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
        } ${readOnly ? "cursor-default" : ""}`}
      >
        N
      </button>
      <button
        type="button"
        onClick={() => set("yes")}
        disabled={readOnly}
        className={`w-5 h-5 rounded text-xs font-bold transition-all print:w-3.5 print:h-3.5 print:text-[6pt] ${
          value === "yes"
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
        } ${readOnly ? "cursor-default" : ""}`}
      >
        J
      </button>
    </span>
  );
}
