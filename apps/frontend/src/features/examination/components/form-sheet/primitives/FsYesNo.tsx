import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { useFormSheet } from "../use-form-sheet";

interface FsYesNoProps {
  name: string;
  value: "yes" | "no" | null;
  disabled?: boolean;
}

export const FsYesNo = memo(function FsYesNo({ name, value, disabled }: FsYesNoProps) {
  const { setValue } = useFormContext();
  const { readOnly } = useFormSheet();
  const inactive = readOnly || disabled;

  const set = (v: "yes" | "no") => {
    if (inactive) return;
    setValue(name, value === v ? null : v, { shouldDirty: true });
  };

  return (
    <span className={`inline-flex gap-0.5${disabled ? " opacity-30" : ""}`}>
      <button
        type="button"
        onClick={() => set("no")}
        disabled={inactive}
        className={`w-5 h-5 rounded text-xs font-bold transition-all print:w-3.5 print:h-3.5 print:text-[6pt] ${
          value === "no"
            ? "bg-slate-700 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
        } ${inactive ? "cursor-default" : ""}`}
      >
        N
      </button>
      <button
        type="button"
        onClick={() => set("yes")}
        disabled={inactive}
        className={`w-5 h-5 rounded text-xs font-bold transition-all print:w-3.5 print:h-3.5 print:text-[6pt] ${
          value === "yes"
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
        } ${inactive ? "cursor-default" : ""}`}
      >
        J
      </button>
    </span>
  );
});
