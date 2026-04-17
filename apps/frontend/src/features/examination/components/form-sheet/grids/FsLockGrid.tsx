/**
 * E8 Joint locking grid.
 *
 * Per side: closedLocking and openLocking, each with:
 * - Blockade (locking yes/no)
 * - lösbar durch Patient (reducibleByPatient, gated by locking=yes)
 * - lösbar durch Untersucher (reducibleByExaminer, gated by locking=yes)
 */

import { E8_LOCKING_TYPE_DESCRIPTIONS } from "@cmdetect/dc-tmd";
import type { Side } from "../../../model/regions";
import { FsYesNo } from "../primitives/FsYesNo";
import { FsConditionalYesNo } from "../primitives/FsConditionalYesNo";
import type { GetValue } from "../use-section-values";

const DISPLAY_SIDES: Side[] = ["right", "left"];
const LOCKING_TYPES = ["closedLocking", "openLocking"] as const;

interface FsLockGridProps {
  getValue: GetValue;
}

export function FsLockGrid({ getValue }: FsLockGridProps) {
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
              {LOCKING_TYPES.map((type) => {
                const basePath = `e8.${side}.${type}`;
                const locking = getValue(`${basePath}.locking`) as "yes" | "no" | null;
                return (
                  <tr key={type} className="border-t border-slate-100">
                    <td className="text-slate-600 py-0.5">{E8_LOCKING_TYPE_DESCRIPTIONS[type]}</td>
                    <td className="text-center py-0.5">
                      <FsYesNo name={`${basePath}.locking`} value={locking} />
                    </td>
                    <td className="text-center py-0.5">
                      <FsConditionalYesNo
                        name={`${basePath}.reducibleByPatient`}
                        value={getValue(`${basePath}.reducibleByPatient`) as "yes" | "no" | null}
                        siblingValue={locking}
                        equals="yes"
                      />
                    </td>
                    <td className="text-center py-0.5">
                      <FsConditionalYesNo
                        name={`${basePath}.reducibleByExaminer`}
                        value={getValue(`${basePath}.reducibleByExaminer`) as "yes" | "no" | null}
                        siblingValue={locking}
                        equals="yes"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
