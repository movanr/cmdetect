/**
 * PainFindingsSummary — Collapsible pain findings reference card.
 *
 * Shows E1A-highlighted head diagrams with side/region toggles and
 * detailed U4B/U4C, U5A-C, U9/U10 findings for the selected region+side.
 */

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  PALPATION_SITES,
  REGIONS,
  SIDE_KEYS,
  SIDES,
  SITE_CONFIG,
  SITES_BY_GROUP,
  getValueAtPath as get,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { ChevronDown, ChevronRight, Stethoscope } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { EMPTY_REGION_STATUS, type RegionStatus } from "../../examination";
import { translateValue } from "../utils/criterion-data-display";
import { SummaryDiagrams } from "./SummaryDiagrams";

interface PainFindingsSummaryProps {
  criteriaData: Record<string, unknown>;
  className?: string;
}

const CORE_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];
const EXTRA_REGIONS: readonly Region[] = ["otherMast", "nonMast"];

const OPENING_STEPS = [
  { key: "maxUnassisted", badge: "U4B", label: "max. aktiver Mundöffnung" },
  { key: "maxAssisted", badge: "U4C", label: "max. passiver Mundöffnung" },
] as const;

const LATERAL_STEPS = [
  { key: "lateralRight", badge: "U5A", label: "Laterotrusion rechts" },
  { key: "lateralLeft", badge: "U5B", label: "Laterotrusion links" },
  { key: "protrusive", badge: "U5C", label: "Protrusion" },
] as const;

function getE1ALabel(painLocs: Region[] | undefined, region: Region): string {
  if (painLocs === undefined) return "—";
  return painLocs.includes(region) ? "Ja" : "Nein";
}

export function PainFindingsSummary({
  criteriaData,
  className,
}: PainFindingsSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        type="button"
        className="flex items-center gap-2 w-full py-2.5 px-3 hover:bg-muted/50 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium flex-1">Schmerzbefunde (U1A, U4–U5, U9–U10)</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="border-t px-3 py-3">
          <PainFindingsContent criteriaData={criteriaData} />
        </div>
      )}
    </div>
  );
}

// ── Inner content ─────────────────────────────────────────────────────

function PainFindingsContent({ criteriaData }: { criteriaData: Record<string, unknown> }) {
  const [selectedSide, setSelectedSide] = useState<Side | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showAllRegions, setShowAllRegions] = useState(false);

  const painLocations = useMemo(
    () => ({
      right: get(criteriaData, "e1.painLocation.right") as Region[] | undefined,
      left: get(criteriaData, "e1.painLocation.left") as Region[] | undefined,
    }),
    [criteriaData],
  );

  // Build regionStatuses for head diagram highlighting
  const regionStatuses = useMemo(() => {
    const result: {
      left: Partial<Record<Region, RegionStatus>>;
      right: Partial<Record<Region, RegionStatus>>;
    } = { left: {}, right: {} };
    const regions: readonly Region[] = showAllRegions
      ? [...CORE_REGIONS, "nonMast"]
      : CORE_REGIONS;
    for (const side of SIDE_KEYS) {
      for (const r of regions) {
        if (painLocations[side]?.includes(r)) {
          result[side][r] = { ...EMPTY_REGION_STATUS, hasData: true, isPainPositive: true };
        } else {
          result[side][r] = EMPTY_REGION_STATUS;
        }
      }
    }
    return result;
  }, [painLocations, showAllRegions]);

  const handleRegionClick = useCallback((side: Side, region: Region) => {
    setSelectedSide(side);
    setSelectedRegion(region);
  }, []);

  const diagramRegions: readonly Region[] = showAllRegions
    ? [...CORE_REGIONS, "nonMast"]
    : CORE_REGIONS;

  const hasSelection = selectedSide !== null && selectedRegion !== null;

  return (
    <div className="space-y-3 pt-2">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        U1A Schmerzlokalisation
      </div>

      <SummaryDiagrams
        regions={diagramRegions}
        selectedSide={selectedSide ?? undefined}
        selectedRegion={
          selectedRegion === "otherMast" || selectedRegion === undefined ? null : selectedRegion
        }
        onRegionClick={handleRegionClick}
        regionStatuses={regionStatuses}
      />

      <div className="flex flex-col gap-3">
        {/* Side toggles */}
        <ToggleGroup
          type="single"
          value={selectedSide ?? ""}
          onValueChange={(v) => {
            if (v) setSelectedSide(v as Side);
          }}
          variant="outline"
          className="justify-start"
        >
          <ToggleGroupItem value="right" className="text-sm">
            Rechte Seite
          </ToggleGroupItem>
          <ToggleGroupItem value="left" className="text-sm">
            Linke Seite
          </ToggleGroupItem>
        </ToggleGroup>

        {/* Region toggles with E1A values */}
        <ToggleGroup
          type="single"
          value={selectedRegion ?? ""}
          onValueChange={(v) => {
            if (v) setSelectedRegion(v as Region);
          }}
          variant="outline"
          className="justify-start flex-wrap"
        >
          {CORE_REGIONS.map((r) => (
            <ToggleGroupItem key={r} value={r} className="text-sm">
              {REGIONS[r]}
              {selectedSide && `: ${getE1ALabel(painLocations[selectedSide], r)}`}
            </ToggleGroupItem>
          ))}
          {showAllRegions &&
            EXTRA_REGIONS.map((r) => (
              <ToggleGroupItem key={r} value={r} className="text-sm">
                {REGIONS[r]}
              </ToggleGroupItem>
            ))}
        </ToggleGroup>

        <div className="flex items-center gap-2">
          <Checkbox
            id="pain-findings-all-regions"
            checked={showAllRegions}
            onCheckedChange={(checked) => {
              if (checked) {
                setShowAllRegions(true);
              } else {
                setShowAllRegions(false);
                if (selectedRegion && EXTRA_REGIONS.includes(selectedRegion)) {
                  setSelectedRegion("temporalis");
                }
              }
            }}
          />
          <label
            htmlFor="pain-findings-all-regions"
            className="text-xs text-muted-foreground cursor-pointer select-none"
          >
            Ergänzende Palpationsgebiete anzeigen
          </label>
        </div>
      </div>

      {/* Detailed findings */}
      {hasSelection && (
        <PainFindingsDetail
          criteriaData={criteriaData}
          side={selectedSide!}
          region={selectedRegion!}
        />
      )}
    </div>
  );
}

// ── Detail sub-component ──────────────────────────────────────────────

function PainFindingsDetail({
  criteriaData,
  side,
  region,
}: {
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
}) {
  const locationLabel = `${REGIONS[region]}, ${SIDES[side]}`;
  const isSupplemental = region === "otherMast" || region === "nonMast";

  const palpationSites = useMemo(() => {
    const sites = SITES_BY_GROUP[region] ?? [];
    const section = isSupplemental ? "e10" : "e9";
    return sites.filter((s) => SITE_CONFIG[s].section === section);
  }, [region, isSupplemental]);

  const palpationSection = isSupplemental ? "e10" : "e9";
  const palpationBadge = isSupplemental ? "U10" : "U9";

  // Column flags derived from site configs for this region
  const showHeadache = !isSupplemental && palpationSites.some((s) => SITE_CONFIG[s].hasHeadache);
  const showSpreading = !isSupplemental && palpationSites.some((s) => SITE_CONFIG[s].hasSpreading);
  const showReferred = true;

  return (
    <div className="space-y-2 border-t pt-3">
      <div className="text-xs font-semibold text-muted-foreground">
        Schmerzbefunde für {locationLabel}
      </div>

      {/* U4B/U4C rows — only for core regions */}
      {!isSupplemental &&
        OPENING_STEPS.map(({ key, badge }) => (
          <div key={key} className="flex items-baseline gap-1.5 text-xs flex-wrap">
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {badge}
            </Badge>
            <span className="text-muted-foreground">Schmerz:</span>
            <span className="font-medium">
              {translateValue(get(criteriaData, `e4.${key}.${side}.${region}.pain`))}
            </span>
            <span className="text-muted-foreground ml-1">Bekannter Schmerz:</span>
            <span className="font-medium">
              {translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarPain`))}
            </span>
            {showHeadache && (
              <>
                <span className="text-muted-foreground ml-1">Bekannter Kopfschmerz:</span>
                <span className="font-medium">
                  {translateValue(
                    get(criteriaData, `e4.${key}.${side}.${region}.familiarHeadache`),
                  )}
                </span>
              </>
            )}
          </div>
        ))}

      {/* U5A/U5B/U5C rows — only for core regions */}
      {!isSupplemental &&
        LATERAL_STEPS.map(({ key, badge }) => (
          <div key={key} className="flex items-baseline gap-1.5 text-xs flex-wrap">
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {badge}
            </Badge>
            <span className="text-muted-foreground">Schmerz:</span>
            <span className="font-medium">
              {translateValue(get(criteriaData, `e5.${key}.${side}.${region}.pain`))}
            </span>
            <span className="text-muted-foreground ml-1">Bekannter Schmerz:</span>
            <span className="font-medium">
              {translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarPain`))}
            </span>
            {showHeadache && (
              <>
                <span className="text-muted-foreground ml-1">Bekannter Kopfschmerz:</span>
                <span className="font-medium">
                  {translateValue(
                    get(criteriaData, `e5.${key}.${side}.${region}.familiarHeadache`),
                  )}
                </span>
              </>
            )}
          </div>
        ))}

      {/* Palpation table — U9 for core regions, U10 for supplemental */}
      {palpationSites.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5 text-xs">
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {palpationBadge}
            </Badge>
            <span className="text-muted-foreground">Palpation</span>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 pr-2 font-medium text-muted-foreground">Stelle</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground">Schmerz</th>
                <th className="text-left py-1 px-2 font-medium text-muted-foreground">
                  Bekannter Schmerz
                </th>
                {showHeadache && (
                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">
                    Bekannter Kopfschmerz
                  </th>
                )}
                {showSpreading && (
                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">
                    Ausbreitender Schmerz
                  </th>
                )}
                {showReferred && (
                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">
                    Übertragener Schmerz
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {palpationSites.map((s) => (
                <tr key={s} className="border-b last:border-0">
                  <td className="py-1 pr-2 text-muted-foreground">{PALPATION_SITES[s]}</td>
                  <td className="py-1 px-2 font-medium">
                    {translateValue(
                      get(criteriaData, `${palpationSection}.${side}.${s}.pain`),
                    )}
                  </td>
                  <td className="py-1 px-2 font-medium">
                    {translateValue(
                      get(criteriaData, `${palpationSection}.${side}.${s}.familiarPain`),
                    )}
                  </td>
                  {showHeadache && (
                    <td className="py-1 px-2 font-medium">
                      {SITE_CONFIG[s].hasHeadache
                        ? translateValue(
                            get(criteriaData, `${palpationSection}.${side}.${s}.familiarHeadache`),
                          )
                        : "—"}
                    </td>
                  )}
                  {showSpreading && (
                    <td className="py-1 px-2 font-medium">
                      {SITE_CONFIG[s].hasSpreading
                        ? translateValue(
                            get(criteriaData, `${palpationSection}.${side}.${s}.spreadingPain`),
                          )
                        : "—"}
                    </td>
                  )}
                  {showReferred && (
                    <td className="py-1 px-2 font-medium">
                      {translateValue(
                        get(criteriaData, `${palpationSection}.${side}.${s}.referredPain`),
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
