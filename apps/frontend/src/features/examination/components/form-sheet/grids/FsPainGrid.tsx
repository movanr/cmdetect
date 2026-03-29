/**
 * Bilateral pain interview grid for E4/E5 movements.
 *
 * Renders a 2-column (left/right) table with 5 regions × 3 pain questions.
 * Reads/writes directly to RHF paths: {prefix}.{side}.{region}.{painQuestion}
 */

import {
  REGIONS,
  REGION_KEYS,
  SIDES,
  getMovementPainQuestions,
  type Region,
  type Side,
} from "../../../model/regions";

/** Display order: right first */
const DISPLAY_SIDES: Side[] = ["right", "left"];
import { FsYesNo } from "../primitives/FsYesNo";
import { FsConditionalYesNo } from "../primitives/FsConditionalYesNo";

interface FsPainGridProps {
  /** RHF path prefix, e.g. "e4.maxUnassisted" */
  prefix: string;
}

const COL_HEADERS = {
  pain: "Schmerz",
  familiarPain: "Bekannter Schmerz",
  familiarHeadache: "Bekannter Kopfschmerz",
};

export function FsPainGrid({ prefix }: FsPainGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {DISPLAY_SIDES.map((side) => (
        <div key={side}>
          <div className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wider print:text-[6pt]">
            {SIDES[side]}
          </div>
          <table className="w-full text-xs print:text-[6pt]">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left font-normal py-0 pr-1 w-20 print:w-16"></th>
                <th className="font-normal py-0 w-11">{COL_HEADERS.pain}</th>
                <th className="font-normal py-0 w-11">{COL_HEADERS.familiarPain}</th>
                <th className="font-normal py-0 w-11">{COL_HEADERS.familiarHeadache}</th>
              </tr>
            </thead>
            <tbody>
              {REGION_KEYS.map((region: Region) => {
                const questions: readonly string[] = getMovementPainQuestions(region);
                return (
                  <tr key={region} className="border-t border-slate-100">
                    <td className="text-slate-600 py-0.5 pr-1">{REGIONS[region]}</td>
                    {(["pain", "familiarPain", "familiarHeadache"] as const).map((q) => {
                      if (!questions.includes(q)) {
                        return (
                          <td key={q} className="text-center py-0.5">
                            <span className="text-slate-200">—</span>
                          </td>
                        );
                      }
                      const path = `${prefix}.${side}.${region}.${q}`;
                      return (
                        <td key={q} className="text-center py-0.5">
                          {q === "pain" ? (
                            <FsYesNo name={path} />
                          ) : (
                            <FsConditionalYesNo name={path} sibling="pain" equals="yes" />
                          )}
                        </td>
                      );
                    })}
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
