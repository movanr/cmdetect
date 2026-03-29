/**
 * E9 Palpation grid — full detailed view.
 *
 * Renders all 8 sites grouped by region (temporalis, masseter, TMJ),
 * with variable pain question columns per group.
 *
 * Always renders in "detailed + standard" mode for maximum information density.
 */

import {
  PALPATION_SITES,
  SITES_BY_GROUP,
  SITE_CONFIG,
  type PalpationSite,
  type PainType,
} from "../../../model/regions";
import { FsYesNo } from "../primitives/FsYesNo";

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
    sites: [
      ...SITES_BY_GROUP.temporalis,
      ...SITES_BY_GROUP.masseter,
    ],
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
  return true; // pain, familiarPain, referredPain always present
}

export function FsPalpationGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 mt-1 print:gap-x-2 print:mt-0.5">
      {SIDE_KEYS.map((side) => (
        <div key={side}>
          <div className="text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wider print:text-[6pt]">
            {SIDE_LABELS[side]}
          </div>

          {E9_GROUPS.map((group) => (
            <div key={group.label} className="mb-2 print:mb-1">
              <div className="text-xs text-slate-400 mb-0.5 font-medium print:text-[5pt]">
                {group.label} {group.sublabel}
              </div>
              <table className="w-full text-xs print:text-[6pt]">
                <thead>
                  <tr className="text-slate-400">
                    <th className="text-left font-normal py-0 w-24 print:w-16"></th>
                    {group.columns.map((col) => (
                      <th key={col} className="font-normal py-0 w-12 print:w-9 leading-tight whitespace-pre-line">
                        {COL_LABELS[col]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.sites.map((site) => (
                    <tr key={site} className="border-t border-slate-100">
                      <td className="text-slate-600 py-0.5 pr-0.5 truncate max-w-[6rem] print:max-w-[4rem]">
                        {PALPATION_SITES[site]
                          .replace("Kiefergelenk ", "")
                          .replace("(lateraler Pol)", "Lat. Pol (0,5 kg)")
                          .replace("(um den lateralen Pol)", "Um lat. Pol (1 kg)")}
                      </td>
                      {group.columns.map((col) =>
                        siteHasColumn(site, col) ? (
                          <td key={col} className="text-center py-0.5">
                            <FsYesNo name={`e9.${side}.${site}.${col}`} />
                          </td>
                        ) : (
                          <td key={col} className="text-center py-0.5">
                            <span className="text-slate-200">—</span>
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
