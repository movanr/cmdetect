import { useController, useFormContext } from "react-hook-form";
import { useFormSheet } from "../use-form-sheet";

interface FsMeasurementProps {
  name: string;
  width?: string;
  min?: number;
  max?: number;
}

export function FsMeasurement({ name, width = "w-14", min, max }: FsMeasurementProps) {
  const { control, setError, clearErrors } = useFormContext();
  const { readOnly } = useFormSheet();
  const { field, fieldState } = useController({ name, control });

  if (readOnly) {
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        <span className="font-medium">{field.value ?? "–"}</span>
        <span className="text-slate-400">mm</span>
      </span>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    field.onChange(val === "" ? null : Number(val));
    if (fieldState.error) clearErrors(name);
  };

  const handleBlur = () => {
    field.onBlur();
    const val = field.value;
    if (val != null && val !== "") {
      const numVal = Number(val);
      if (min !== undefined && numVal < min) {
        setError(name, { type: "range", message: `Min: ${min}` });
      } else if (max !== undefined && numVal > max) {
        setError(name, { type: "range", message: `Max: ${max}` });
      }
    }
  };

  const borderClass = fieldState.error
    ? "border-red-400 focus:ring-red-400"
    : "border-slate-300 focus:ring-blue-400";

  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        min={min}
        max={max}
        value={field.value ?? ""}
        onChange={handleChange}
        onBlur={handleBlur}
        title={fieldState.error?.message}
        className={`${width} h-6 px-1 text-xs text-center border ${borderClass} rounded bg-white focus:outline-none focus:ring-1 print:border-0 print:h-auto print:p-0 print:text-[7pt]`}
      />
      <span className="text-xs text-slate-400 print:text-[6pt]">mm</span>
    </span>
  );
}
