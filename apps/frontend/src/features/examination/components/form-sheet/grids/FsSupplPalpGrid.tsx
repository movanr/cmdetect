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
import { COMMON } from "../../../labels";
import { FsBooleanCheckbox } from "../primitives/FsBooleanCheckbox";
import { FsYesNo } from "../primitives/FsYesNo";
import { FsConditionalYesNo } from "../primitives/FsConditionalYesNo";
import type { GetValue } from "../use-section-values";

const SIDE_KEYS = ["right", "left"] as const;
type Side = (typeof SIDE_KEYS)[number];

const COL_LABELS: Record<string, string> = {
  pain: "Schmerz",
  familiarPain: "Bekannter\nSchmerz",
  referredPain: "Übertragener\nSchmerz",
};

interface FsSupplPalpGridProps {
  getValue: GetValue;
  /** Per-side RHF paths for the refused boolean. Renders a checkbox inline in the side header. */
  refusedPaths?: Record<Side, string>;
  /** Fires after the refused value is written — parent uses it to clear data. */
  onRefuseChange?: (side: Side, refused: boolean) => void;
}

export function FsSupplPalpGrid({
  getValue,
  refusedPaths,
  onRefuseChange,
}: FsSupplPalpGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {SIDE_KEYS.map((side) => {
        const refusedPath = refusedPaths?.[side];
        const sideRefused = refusedPath
          ? getValue(refusedPath) === true
          : false;
        return (
        <div key={side}>
          <div className="flex items-center gap-3 mb-0.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider print:text-[6pt]">
              {side === "right" ? "Rechte Seite (0,5 kg)" : "Linke Seite (0,5 kg)"}
            </span>
            {refusedPath && (
              <FsBooleanCheckbox
                name={refusedPath}
                label={COMMON.refusedFull}
                title={COMMON.refusedTooltip}
                onChange={(v) => onRefuseChange?.(side, v)}
              />
            )}
          </div>
          <table className={`w-full text-xs print:text-[6pt] ${sideRefused ? "opacity-40" : ""}`}>
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
        );
      })}
    </div>
  );
}
