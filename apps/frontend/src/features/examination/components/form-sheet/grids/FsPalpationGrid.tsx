/**
 * E9 Palpation grid — full detailed view.
 *
 * Renders all 8 sites grouped by region (temporalis, masseter, TMJ),
 * with variable pain question columns per group.
 *
 * Sides are stacked vertically (right, then left) to give each side
 * the full container width — needed for 5 pain columns.
 */

import {
  PALPATION_SITES,
  SITES_BY_GROUP,
  SITE_CONFIG,
  type PalpationSite,
  type PainType,
} from "../../../model/regions";
import { FsYesNo } from "../primitives/FsYesNo";
import { FsConditionalYesNo } from "../primitives/FsConditionalYesNo";
import type { GetValue } from "../use-section-values";

const SIDE_KEYS = ["right", "left"] as const;
const SIDE_LABELS = { right: "Rechte Seite", left: "Linke Seite" };

// E9 site groups with their applicable pain columns
const E9_GROUPS: {
  label: string;
  sublabel?: string;
  sites: readonly PalpationSite[];
  columns: readonly PainType[];
}[] = [
  {
    label: "Muskelschmerzen",
    sublabel: "(1 kg)",
    sites: [...SITES_BY_GROUP.temporalis, ...SITES_BY_GROUP.masseter],
    columns: ["pain", "familiarPain", "familiarHeadache", "spreadingPain", "referredPain"],
  },
  {
    label: "Kiefergelenk",
    sites: SITES_BY_GROUP.tmj,
    columns: ["pain", "familiarPain", "referredPain"],
  },
];

const COL_LABELS: Record<PainType, string> = {
  pain: "Schmerz",
  familiarPain: "Bekannter\nSchmerz",
  familiarHeadache: "Bekannter\nKopfschmerz",
  spreadingPain: "Ausbreitender\nSchmerz",
  referredPain: "Übertragener\nSchmerz",
};

function siteHasColumn(site: PalpationSite, column: PainType): boolean {
  const config = SITE_CONFIG[site];
  if (column === "familiarHeadache") return config.hasHeadache;
  if (column === "spreadingPain") return config.hasSpreading;
  return true;
}

interface FsPalpationGridProps {
  getValue: GetValue;
}

export function FsPalpationGrid({ getValue }: FsPalpationGridProps) {
  return (
    <div className="space-y-4 mt-1 print:space-y-2 print:mt-0.5">
      {SIDE_KEYS.map((side) => (
        <div key={side}>
          <div className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider print:text-[6pt]">
            {SIDE_LABELS[side]}
          </div>

          <div className="flex gap-6 print:gap-3">
            {/* Muscle sites (left) + TMJ sites (right) side by side */}
            {E9_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="text-xs text-slate-400 mb-0.5 font-medium print:text-[5pt]">
                  {group.label} {group.sublabel}
                </div>
                <table className="text-xs print:text-[6pt]">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="text-left font-normal py-0 pr-2 min-w-[7rem] print:min-w-[5rem]"></th>
                      {group.columns.map((col) => (
                        <th
                          key={col}
                          className="font-normal py-0 px-1 leading-tight whitespace-pre-line text-center"
                        >
                          {COL_LABELS[col]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.sites.map((site) => (
                      <tr key={site} className="border-t border-slate-100">
                        <td className="text-slate-600 py-0.5 pr-2 whitespace-nowrap">
                          {PALPATION_SITES[site]
                            .replace("Kiefergelenk ", "")
                            .replace("(lateraler Pol)", "Lat. Pol (0,5 kg)")
                            .replace("(um den lateralen Pol)", "Um lat. Pol (1 kg)")}
                        </td>
                        {group.columns.map((col) => {
                          const path = `e9.${side}.${site}.${col}`;
                          return siteHasColumn(site, col) ? (
                            <td key={col} className="text-center py-0.5 px-1">
                              {col === "pain" ? (
                                <FsYesNo name={path} value={getValue(path) as "yes" | "no" | null} />
                              ) : (
                                <FsConditionalYesNo
                                  name={path}
                                  value={getValue(path) as "yes" | "no" | null}
                                  siblingValue={getValue(`e9.${side}.${site}.pain`)}
                                  equals="yes"
                                />
                              )}
                            </td>
                          ) : (
                            <td key={col} className="text-center py-0.5 px-1">
                              <span className="text-slate-200">—</span>
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
        </div>
      ))}
    </div>
  );
}
