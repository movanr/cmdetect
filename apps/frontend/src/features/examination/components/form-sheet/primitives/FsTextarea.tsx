import { useController, useFormContext } from "react-hook-form";
import { useFormSheet } from "../use-form-sheet";

interface FsTextareaProps {
  name: string;
  placeholder?: string;
}

export function FsTextarea({ name, placeholder }: FsTextareaProps) {
  const { control } = useFormContext();
  const { readOnly } = useFormSheet();
  const { field } = useController({ name, control });

  if (readOnly) {
    return field.value ? (
      <p className="text-xs text-slate-700 whitespace-pre-wrap print:text-[7pt]">{field.value}</p>
    ) : (
      <p className="text-xs text-slate-300 italic print:text-[7pt]">–</p>
    );
  }

  return (
    <textarea
      value={field.value ?? ""}
      onChange={(e) => field.onChange(e.target.value || null)}
      rows={2}
      placeholder={placeholder}
      className="w-full text-xs border border-slate-200 rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y print:border-0 print:p-0 print:text-[7pt]"
    />
  );
}
