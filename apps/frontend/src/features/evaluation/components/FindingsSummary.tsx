/**
 * FindingsSummary — Collapsible tabbed findings reference card.
 *
 * Organises SQ answers and examination findings by the 5 SQ categories:
 * Schmerzen, Kopfschmerzen, Gelenkgeräusche, Kieferklemme, Kiefersperre.
 * The Schmerzen tab additionally shows E1A-highlighted head diagrams with
 * side/region toggles and detailed U4B/U4C, U5A-C, U9/U10 findings.
 */

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getValueAtPath as get,
  PALPATION_SITES,
  REGIONS,
  SIDE_KEYS,
  SITE_CONFIG,
  SITES_BY_GROUP,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import {
  isQuestionIdEnabled,
  SQ_DISPLAY_IDS,
  SQ_ENABLE_WHEN,
  SQ_QUESTION_SHORT_LABELS,
  SQ_SECTIONS,
  type SQQuestionId,
  type SQSection,
} from "@cmdetect/questionnaires";
import { ChevronDown, ChevronRight, Stethoscope } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { EMPTY_REGION_STATUS, HeadDiagram, type RegionStatus } from "../../examination";
import { translateValue } from "../utils/criterion-data-display";

interface FindingsSummaryProps {
  criteriaData: Record<string, unknown>;
  className?: string;
  alwaysOpen?: boolean;
}

export function FindingsSummary({ criteriaData, className, alwaysOpen }: FindingsSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const expanded = alwaysOpen || isOpen;

  const sqData = useMemo(
    () => (criteriaData["sq"] as Record<string, unknown> | undefined) ?? {},
    [criteriaData]
  );

  const content = (
    <Tabs defaultValue="pain">
      <TabsList className="flex-wrap h-auto">
        {SQ_SECTIONS.map((section) => (
          <TabsTrigger key={section.id} value={section.id}>
            {section.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {SQ_SECTIONS.map((section) => (
        <TabsContent key={section.id} value={section.id}>
          <SQSectionQuestions section={section} sqData={sqData} />
          {section.id === "pain" && <PainFindingsContent criteriaData={criteriaData} />}
        </TabsContent>
      ))}
    </Tabs>
  );

  if (alwaysOpen) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        type="button"
        className="flex items-center gap-2 w-full py-2.5 px-3 hover:bg-muted/50 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Stethoscope className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium flex-1">Befundübersicht</span>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && <div className="border-t px-3 py-3">{content}</div>}
    </div>
  );
}

// ── SQ question rendering (absorbed from SymptomQuestionnaireReference) ──

function formatDuration(value: unknown): string {
  if (value == null || typeof value !== "object") return "—";
  const v = value as { years?: number; months?: number };
  const parts: string[] = [];
  if (v.years != null && v.years > 0) parts.push(`${v.years} Jahre`);
  if (v.months != null && v.months > 0) parts.push(`${v.months} Monate`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

const DURATION_QUESTIONS = new Set<SQQuestionId>(["SQ2", "SQ6"]);

function formatAnswer(id: SQQuestionId, value: unknown): string {
  if (DURATION_QUESTIONS.has(id)) return formatDuration(value);
  return translateValue(value);
}

function SQSectionQuestions({
  section,
  sqData,
}: {
  section: SQSection;
  sqData: Record<string, unknown>;
}) {
  return (
    <div className="space-y-1 pt-2">
      {section.questionIds.map((qId) => {
        const enabled = isQuestionIdEnabled(qId, SQ_ENABLE_WHEN, sqData);
        const value = sqData[qId];
        const displayId = SQ_DISPLAY_IDS[qId];
        const label = SQ_QUESTION_SHORT_LABELS[qId];

        return (
          <div
            key={qId}
            className={cn("flex items-baseline gap-1.5 text-xs", !enabled && "opacity-40")}
          >
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {displayId}
            </Badge>
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium whitespace-nowrap">
              {enabled ? formatAnswer(qId, value) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Pain findings content (unchanged from PainFindingsSummary) ──────────

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

function PainFindingsContent({ criteriaData }: { criteriaData: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState<{ side: Side; region: Region } | null>(null);
  const [showAllRegions, setShowAllRegions] = useState(false);

  const toggleRegion = useCallback((side: Side, region: Region) => {
    setExpanded((prev) =>
      prev?.side === side && prev?.region === region ? null : { side, region }
    );
  }, []);

  const painLocations = useMemo(() => {
    // Treat empty arrays as undefined — E1 has an explicit "keine" option,
    // so [] means skipped/not examined, not "no pain".
    const toRegions = (v: unknown): Region[] | undefined => {
      if (!Array.isArray(v) || v.length === 0) return undefined;
      return v as Region[];
    };
    return {
      right: toRegions(get(criteriaData, "e1.painLocation.right")),
      left: toRegions(get(criteriaData, "e1.painLocation.left")),
    };
  }, [criteriaData]);

  const regionStatuses = useMemo(() => {
    const result: {
      left: Partial<Record<Region, RegionStatus>>;
      right: Partial<Record<Region, RegionStatus>>;
    } = { left: {}, right: {} };
    const regions: readonly Region[] = showAllRegions ? [...CORE_REGIONS, "nonMast"] : CORE_REGIONS;
    for (const side of SIDE_KEYS) {
      const locs = painLocations[side];
      for (const r of regions) {
        if (locs === undefined) {
          // E1 skipped / not examined → UNDEFINED (amber in diagram)
          result[side][r] = { ...EMPTY_REGION_STATUS, hasData: true, isPainPositive: true };
        } else if (locs.includes(r)) {
          // E1 completed, region has pain → POSITIVE
          result[side][r] = {
            ...EMPTY_REGION_STATUS,
            hasData: true,
            isPainPositive: true,
            hasFamiliarPain: true,
            isComplete: true,
          };
        } else {
          // E1 completed, region has no pain → NEGATIVE
          result[side][r] = { ...EMPTY_REGION_STATUS, hasData: true, isComplete: true };
        }
      }
    }
    return result;
  }, [painLocations, showAllRegions]);

  const visibleRegions: readonly Region[] = showAllRegions
    ? [...CORE_REGIONS, ...EXTRA_REGIONS]
    : CORE_REGIONS;

  const diagramRegions = visibleRegions.filter((r) => r !== "otherMast");

  return (
    <div className="space-y-3 pt-3 border-t mt-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Untersuchungsbefunde Schmerz
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(["right", "left"] as const).map((side) => (
          <div key={side} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {side === "right" ? "Rechts" : "Links"}
            </span>
            <HeadDiagram
              side={side}
              regions={diagramRegions}
              regionStatuses={regionStatuses[side]}
              selectedRegion={
                expanded?.side === side && expanded.region !== "otherMast" ? expanded.region : null
              }
              onRegionClick={(region) => toggleRegion(side, region)}
              hideBackgroundImages
              className="w-full max-w-[180px]"
            />
            {/* Vertical region list */}
            <div className="w-full space-y-1 pt-1">
              {visibleRegions.map((region) => {
                const isPainPositive = painLocations[side]?.includes(region) ?? false;
                const isExpanded = expanded?.side === side && expanded?.region === region;
                return (
                  <div
                    key={region}
                    className={cn(
                      "border rounded border-l-2",
                      isExpanded && "bg-muted/30",
                      painLocations[side] === undefined
                        ? "border-l-amber-400"
                        : isPainPositive
                          ? "border-l-blue-500"
                          : "border-l-muted-foreground/30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleRegion(side, region)}
                      className="flex items-start gap-1.5 w-full text-left py-1.5 px-2 text-xs hover:bg-muted/50 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                      ) : (
                        <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={cn(isPainPositive && "font-semibold")}>
                          {REGIONS[region]}
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
                            U1A
                          </Badge>
                          <span className="text-muted-foreground">
                            Schmerzlokalisation bestätigt:
                          </span>
                          <span className="font-medium">
                            {painLocations[side] === undefined
                              ? "—"
                              : isPainPositive
                                ? "Ja"
                                : "Nein"}
                          </span>
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <PainRegionDetail criteriaData={criteriaData} side={side} region={region} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="pain-findings-all-regions"
          checked={showAllRegions}
          onCheckedChange={(checked) => {
            if (checked) {
              setShowAllRegions(true);
            } else {
              setShowAllRegions(false);
              if (expanded && EXTRA_REGIONS.includes(expanded.region)) {
                setExpanded(null);
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
  );
}

// ── Detail sub-component ──────────────────────────────────────────────

function PainRegionDetail({
  criteriaData,
  side,
  region,
}: {
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
}) {
  const isSupplemental = region === "otherMast" || region === "nonMast";

  const palpationSites = useMemo(() => {
    const sites = SITES_BY_GROUP[region] ?? [];
    const section = isSupplemental ? "e10" : "e9";
    return sites.filter((s) => SITE_CONFIG[s].section === section);
  }, [region, isSupplemental]);

  const palpationSection = isSupplemental ? "e10" : "e9";
  const palpationBadge = isSupplemental ? "U10" : "U9";

  const showSpreading = !isSupplemental && palpationSites.some((s) => SITE_CONFIG[s].hasSpreading);
  const showReferred = true;

  return (
    <div className="space-y-1.5 pl-[26px] pr-2 pb-2">
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
            <span className="text-muted-foreground ml-1">Bek. Schmerz:</span>
            <span className="font-medium">
              {translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarPain`))}
            </span>
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
            <span className="text-muted-foreground ml-1">Bek. Schmerz:</span>
            <span className="font-medium">
              {translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarPain`))}
            </span>
          </div>
        ))}

      {/* Palpation — stacked cards */}
      {palpationSites.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-baseline gap-1.5 text-xs">
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {palpationBadge}
            </Badge>
            <span className="text-muted-foreground">Palpation</span>
          </div>
          <div className="space-y-1">
            {palpationSites.map((s) => (
              <div key={s} className="border rounded p-1.5 text-xs space-y-0.5">
                <div className="font-medium text-muted-foreground">{PALPATION_SITES[s]}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>
                    <span className="text-muted-foreground">Schmerz: </span>
                    <span className="font-medium">
                      {translateValue(get(criteriaData, `${palpationSection}.${side}.${s}.pain`))}
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Bek. Schmerz: </span>
                    <span className="font-medium">
                      {translateValue(
                        get(criteriaData, `${palpationSection}.${side}.${s}.familiarPain`)
                      )}
                    </span>
                  </span>
                  {showSpreading && SITE_CONFIG[s].hasSpreading && (
                    <span>
                      <span className="text-muted-foreground">Ausbr. Schmerz: </span>
                      <span className="font-medium">
                        {translateValue(
                          get(criteriaData, `${palpationSection}.${side}.${s}.spreadingPain`)
                        )}
                      </span>
                    </span>
                  )}
                  {showReferred && (
                    <span>
                      <span className="text-muted-foreground">Übertr. Schmerz: </span>
                      <span className="font-medium">
                        {translateValue(
                          get(criteriaData, `${palpationSection}.${side}.${s}.referredPain`)
                        )}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
