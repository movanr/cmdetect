import { useController, useFormContext } from "react-hook-form";
import { useFormSheet } from "../FormSheetContext";

interface FsMeasurementProps {
  name: string;
  width?: string;
}

export function FsMeasurement({ name, width = "w-14" }: FsMeasurementProps) {
  const { control } = useFormContext();
  const { readOnly } = useFormSheet();
  const { field } = useController({ name, control });

  if (readOnly) {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <span className="font-medium">{field.value ?? "–"}</span>
        <span className="text-slate-400">mm</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        value={field.value ?? ""}
        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
        className={`${width} h-6 px-1 text-xs text-center border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 print:border-0 print:h-auto print:p-0 print:text-[7pt]`}
      />
      <span className="text-xs text-slate-400 print:text-[6pt]">mm</span>
    </span>
  );
}
