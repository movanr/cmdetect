/**
 * E10 Supplemental palpation grid.
 *
 * 4 sites × 3 columns (pain, familiarPain, referredPain) × 2 sides.
 */

import {
  E10_SITE_KEYS,
  E10_PAIN_QUESTIONS,
  PALPATION_SITES,
  type PalpationSite,
  type PainType,
} from "../../../model/regions";
import { FsYesNo } from "../primitives/FsYesNo";

const SIDE_KEYS = ["right", "left"] as const;

const COL_ABBREVIATIONS: Record<string, string> = {
  pain: "Schmerz",
  familiarPain: "Bek.Schm.",
  referredPain: "Übertr.",
};

export function FsSupplPalpGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {SIDE_KEYS.map((side) => (
        <div key={side}>
          <div className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wider print:text-[6pt]">
            {side === "right" ? "Rechte Seite (0,5 kg)" : "Linke Seite (0,5 kg)"}
          </div>
          <table className="w-full text-xs print:text-[6pt]">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left font-normal py-0 w-32 print:w-20"></th>
                {E10_PAIN_QUESTIONS.map((col) => (
                  <th key={col} className="font-normal py-0 w-11 print:w-8">
                    {COL_ABBREVIATIONS[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {E10_SITE_KEYS.map((site: PalpationSite) => (
                <tr key={site} className="border-t border-slate-100">
                  <td className="text-slate-600 py-0.5">{PALPATION_SITES[site]}</td>
                  {E10_PAIN_QUESTIONS.map((col: PainType) => (
                    <td key={col} className="text-center py-0.5">
                      <FsYesNo name={`e10.${side}.${site}.${col}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
