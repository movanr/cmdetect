/**
 * E6 Joint sounds grid: opening/closing with click + crepitus.
 *
 * Per side: click has separate examinerOpen/examinerClose + patient + painWithClick + familiarPain.
 * Crepitus has examinerOpen/examinerClose + patient only.
 */

import {
  JOINT_SOUND_LABELS,
} from "@cmdetect/dc-tmd";
import type { Side } from "../../../model/regions";

const DISPLAY_SIDES: Side[] = ["right", "left"];
import { FsYesNo } from "../primitives/FsYesNo";
import { FsConditionalYesNo } from "../primitives/FsConditionalYesNo";
import type { GetValue } from "../use-section-values";

interface FsJointSound6GridProps {
  getValue: GetValue;
}

export function FsJointSound6Grid({ getValue }: FsJointSound6GridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {DISPLAY_SIDES.map((side) => {
        const p = `e6.${side}`;
        return (
          <div key={side}>
            <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider print:text-[6pt]">
              {side === "right" ? "Rechtes Kiefergelenk" : "Linkes Kiefergelenk"}
            </div>
            <table className="w-full text-xs print:text-[6pt]">
              <thead>
                <tr className="text-slate-400">
                  <th className="text-left font-normal py-0 w-20 print:w-16"></th>
                  <th className="font-normal py-0 leading-tight">Untersucher<br />Öffnen</th>
                  <th className="font-normal py-0 leading-tight">Untersucher<br />Schließen</th>
                  <th className="font-normal py-0">Patient</th>
                  <th className="font-normal py-0 leading-tight">Schmerzhaftes<br />Knacken</th>
                  <th className="font-normal py-0 leading-tight">Bekannter<br />Schmerz</th>
                </tr>
              </thead>
              <tbody>
                {/* Click row */}
                <tr className="border-t border-slate-100">
                  <td className="text-slate-600 py-0.5">{JOINT_SOUND_LABELS.click}</td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.click.examinerOpen`} value={getValue(`${p}.click.examinerOpen`) as "yes" | "no" | null} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.click.examinerClose`} value={getValue(`${p}.click.examinerClose`) as "yes" | "no" | null} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.click.patient`} value={getValue(`${p}.click.patient`) as "yes" | "no" | null} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsConditionalYesNo
                      name={`${p}.click.painWithClick`}
                      value={getValue(`${p}.click.painWithClick`) as "yes" | "no" | null}
                      siblingValue={getValue(`${p}.click.patient`)}
                      equals="yes"
                    />
                  </td>
                  <td className="text-center py-0.5">
                    <FsConditionalYesNo
                      name={`${p}.click.familiarPain`}
                      value={getValue(`${p}.click.familiarPain`) as "yes" | "no" | null}
                      siblingValue={getValue(`${p}.click.painWithClick`)}
                      equals="yes"
                    />
                  </td>
                </tr>
                {/* Crepitus row */}
                <tr className="border-t border-slate-100">
                  <td className="text-slate-600 py-0.5">{JOINT_SOUND_LABELS.crepitus}</td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.crepitus.examinerOpen`} value={getValue(`${p}.crepitus.examinerOpen`) as "yes" | "no" | null} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.crepitus.examinerClose`} value={getValue(`${p}.crepitus.examinerClose`) as "yes" | "no" | null} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.crepitus.patient`} value={getValue(`${p}.crepitus.patient`) as "yes" | "no" | null} />
                  </td>
                  <td className="text-center py-0.5">
                    <span className="text-slate-200">—</span>
                  </td>
                  <td className="text-center py-0.5">
                    <span className="text-slate-200">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
