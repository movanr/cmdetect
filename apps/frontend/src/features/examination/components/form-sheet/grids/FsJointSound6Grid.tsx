/**
 * E6 Joint sounds grid: opening/closing with click + crepitus.
 *
 * Per side: click has separate examinerOpen/examinerClose + patient + painWithClick + familiarPain.
 * Crepitus has examinerOpen/examinerClose + patient only.
 */

import {
  JOINT_SOUND_LABELS,
  E6_OBSERVER_LABELS,
  CLICK_PAIN_LABELS,
} from "@cmdetect/dc-tmd";
import { SIDE_KEYS, type Side } from "../../../model/regions";
import { FsYesNo } from "../primitives/FsYesNo";

export function FsJointSound6Grid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {SIDE_KEYS.map((side: Side) => {
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
                  <th className="font-normal py-0">{E6_OBSERVER_LABELS.examinerOpen.replace("Unt. ", "Unt.\u00A0")}</th>
                  <th className="font-normal py-0">{E6_OBSERVER_LABELS.examinerClose.replace("Unt. ", "Unt.\u00A0")}</th>
                  <th className="font-normal py-0">{E6_OBSERVER_LABELS.patient}</th>
                  <th className="font-normal py-0">{CLICK_PAIN_LABELS.painWithClick}</th>
                  <th className="font-normal py-0">{CLICK_PAIN_LABELS.familiarPain}</th>
                </tr>
              </thead>
              <tbody>
                {/* Click row */}
                <tr className="border-t border-slate-100">
                  <td className="text-slate-600 py-0.5">{JOINT_SOUND_LABELS.click}</td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.click.examinerOpen`} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.click.examinerClose`} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.click.patient`} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.click.painWithClick`} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.click.familiarPain`} />
                  </td>
                </tr>
                {/* Crepitus row */}
                <tr className="border-t border-slate-100">
                  <td className="text-slate-600 py-0.5">{JOINT_SOUND_LABELS.crepitus}</td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.crepitus.examinerOpen`} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.crepitus.examinerClose`} />
                  </td>
                  <td className="text-center py-0.5">
                    <FsYesNo name={`${p}.crepitus.patient`} />
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
