/**
 * E8 Joint locking grid.
 *
 * Per side: closedLocking and openLocking, each with:
 * - Blockade (locking yes/no)
 * - lösbar durch Patient / Untersucher (mapped from reduction enum)
 *
 * Matches the original DC/TMD form layout with 3 N/J columns.
 */

import { E8_LOCKING_TYPE_DESCRIPTIONS } from "@cmdetect/dc-tmd";
import type { Side } from "../../../model/regions";
import { FsYesNo } from "../primitives/FsYesNo";
import { useFormSheet } from "../use-form-sheet";
import { useFormContext, useWatch } from "react-hook-form";

const DISPLAY_SIDES: Side[] = ["right", "left"];
const LOCKING_TYPES = ["closedLocking", "openLocking"] as const;

export function FsLockGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {DISPLAY_SIDES.map((side) => (
        <div key={side}>
          <div className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wider print:text-[6pt]">
            {side === "right" ? "Rechtes Kiefergelenk" : "Linkes Kiefergelenk"}
          </div>
          <table className="w-full text-xs print:text-[6pt]">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left font-normal py-0 w-32 print:w-24"></th>
                <th className="font-normal py-0">Blockade</th>
                <th className="font-normal py-0 leading-tight" colSpan={2}>
                  lösbar durch
                </th>
              </tr>
              <tr className="text-slate-400">
                <th></th>
                <th></th>
                <th className="font-normal py-0">Patient</th>
                <th className="font-normal py-0">Untersucher</th>
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
                    <ReductionNJ side={side} lockingType={type} option="patient" />
                  </td>
                  <td className="text-center py-0.5">
                    <ReductionNJ side={side} lockingType={type} option="examiner" />
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

/**
 * Maps the reduction enum to individual N/J toggles for Patient and Untersucher columns.
 * When locking=yes: selecting Patient sets reduction="patient", Untersucher sets "examiner".
 */
function ReductionNJ({
  side,
  lockingType,
  option,
}: {
  side: Side;
  lockingType: "closedLocking" | "openLocking";
  option: "patient" | "examiner";
}) {
  const { setValue } = useFormContext();
  const { readOnly } = useFormSheet();
  const basePath = `e8.${side}.${lockingType}`;
  const locking = useWatch({ name: `${basePath}.locking` }) as string | null;
  const reduction = useWatch({ name: `${basePath}.reduction` }) as string | null;

  // Only show values when locking is "yes"
  const value: "yes" | "no" | null =
    locking === "yes"
      ? reduction === option
        ? "yes"
        : reduction != null
          ? "no"
          : null
      : null;

  const handleToggle = (v: "yes" | "no") => {
    if (readOnly || locking !== "yes") return;
    if (v === "yes") {
      setValue(`${basePath}.reduction`, option, { shouldDirty: true });
    } else if (reduction === option) {
      setValue(`${basePath}.reduction`, "notReduced", { shouldDirty: true });
    }
  };

  return (
    <span className="inline-flex gap-0.5">
      <button
        type="button"
        onClick={() => handleToggle("no")}
        disabled={readOnly || locking !== "yes"}
        className={`w-5 h-5 rounded text-xs font-bold transition-all print:w-3.5 print:h-3.5 print:text-[6pt] ${
          value === "no"
            ? "bg-slate-700 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
        } ${readOnly || locking !== "yes" ? "cursor-default opacity-50" : ""}`}
      >
        N
      </button>
      <button
        type="button"
        onClick={() => handleToggle("yes")}
        disabled={readOnly || locking !== "yes"}
        className={`w-5 h-5 rounded text-xs font-bold transition-all print:w-3.5 print:h-3.5 print:text-[6pt] ${
          value === "yes"
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
        } ${readOnly || locking !== "yes" ? "cursor-default opacity-50" : ""}`}
      >
        J
      </button>
    </span>
  );
}
