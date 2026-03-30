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
import { FsConditionalYesNo } from "../primitives/FsConditionalYesNo";
import type { GetValue } from "../use-section-values";

const SIDE_KEYS = ["right", "left"] as const;

const COL_LABELS: Record<string, string> = {
  pain: "Schmerz",
  familiarPain: "Bekannter\nSchmerz",
  referredPain: "Übertragener\nSchmerz",
};

interface FsSupplPalpGridProps {
  getValue: GetValue;
}

export function FsSupplPalpGrid({ getValue }: FsSupplPalpGridProps) {
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
                  <th key={col} className="font-normal py-0 w-14 print:w-10 leading-tight whitespace-pre-line">
                    {COL_LABELS[col]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {E10_SITE_KEYS.map((site: PalpationSite) => (
                <tr key={site} className="border-t border-slate-100">
                  <td className="text-slate-600 py-0.5">{PALPATION_SITES[site]}</td>
                  {E10_PAIN_QUESTIONS.map((col: PainType) => {
                    const path = `e10.${side}.${site}.${col}`;
                    return (
                      <td key={col} className="text-center py-0.5">
                        {col === "pain" ? (
                          <FsYesNo name={path} value={getValue(path) as "yes" | "no" | null} />
                        ) : (
                          <FsConditionalYesNo
                            name={path}
                            value={getValue(path) as "yes" | "no" | null}
                            siblingValue={getValue(`e10.${side}.${site}.pain`)}
                            equals="yes"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
