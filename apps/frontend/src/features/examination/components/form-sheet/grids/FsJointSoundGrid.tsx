/**
 * E7 Joint sounds grid: lateral/protrusive movements.
 *
 * Simpler than E6 — single examiner field (no open/close split).
 * Per side: click has examiner + patient + painWithClick + familiarPain.
 * Crepitus has examiner + patient only.
 */

import {
  JOINT_SOUND_LABELS,
} from "@cmdetect/dc-tmd";
import type { Side } from "../../../model/regions";

const DISPLAY_SIDES: Side[] = ["right", "left"];
import { FsYesNo } from "../primitives/FsYesNo";

export function FsJointSoundGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {DISPLAY_SIDES.map((side) => {
        const p = `e7.${side}`;
        return (
          <div key={side}>
            <div className="text-xs font-semibold text-slate-500 mb-0.5 print:text-[6pt]">
              {side === "right" ? "Rechtes KG" : "Linkes KG"}
            </div>
            <table className="w-full text-xs print:text-[6pt]">
              <thead>
                <tr className="text-slate-400">
                  <th className="text-left font-normal py-0 w-14 print:w-10"></th>
                  <th className="font-normal py-0">Untersucher</th>
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
                    <FsYesNo name={`${p}.click.examiner`} />
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
                    <FsYesNo name={`${p}.crepitus.examiner`} />
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
