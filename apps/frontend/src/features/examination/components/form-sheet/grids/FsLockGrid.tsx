/**
 * E8 Joint locking grid.
 *
 * Per side: closedLocking and openLocking, each with locking yes/no + reduction enum.
 */

import {
  E8_LOCKING_TYPE_DESCRIPTIONS,
  E8_REDUCTION_LABELS,
  type E8Reduction,
} from "@cmdetect/dc-tmd";
import { SIDE_KEYS, type Side } from "../../../model/regions";
import { FsYesNo } from "../primitives/FsYesNo";
import { useFormSheet } from "../FormSheetContext";
import { useFormContext } from "react-hook-form";

const LOCKING_TYPES = ["closedLocking", "openLocking"] as const;
const REDUCTION_OPTIONS = ["patient", "examiner", "notReduced"] as const;

export function FsLockGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {SIDE_KEYS.map((side: Side) => (
        <div key={side}>
          <div className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wider print:text-[6pt]">
            {side === "right" ? "Rechtes Kiefergelenk" : "Linkes Kiefergelenk"}
          </div>
          <table className="w-full text-xs print:text-[6pt]">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left font-normal py-0 w-32 print:w-24"></th>
                <th className="font-normal py-0">Blockade</th>
                <th className="font-normal py-0">Reduktion</th>
              </tr>
            </thead>
            <tbody>
              {LOCKING_TYPES.map((type) => (
                <tr key={type} className="border-t border-slate-100">
                  <td className="text-slate-600 py-0.5">{E8_LOCKING_TYPE_DESCRIPTIONS[type]}</td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`e8.${side}.${type}.locking`} />
                  </td>
                  <td className="text-center py-0.5">
                    <ReductionSelect name={`e8.${side}.${type}.reduction`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function ReductionSelect({ name }: { name: string }) {
  const { watch, setValue } = useFormContext();
  const { readOnly } = useFormSheet();
  const value: E8Reduction | null = watch(name);

  return (
    <span className="inline-flex gap-0.5">
      {REDUCTION_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={readOnly}
          onClick={() => {
            if (!readOnly) setValue(name, value === opt ? null : opt, { shouldDirty: true });
          }}
          className={`px-1 h-5 rounded text-[10px] font-medium transition-all print:text-[5pt] print:h-3.5 ${
            value === opt
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
          } ${readOnly ? "cursor-default" : ""}`}
          title={E8_REDUCTION_LABELS[opt]}
        >
          {opt === "patient" ? "Pat." : opt === "examiner" ? "Unt." : "–"}
        </button>
      ))}
    </span>
  );
}
