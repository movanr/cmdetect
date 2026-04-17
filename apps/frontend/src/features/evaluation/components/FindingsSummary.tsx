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
  E2_MIDLINE_DIRECTIONS,
  E3_OPENING_PATTERNS,
  E4_PAIN_STEPS,
  E5_STEPS,
  E6_OBSERVER_LABELS,
  EXAMINATION_PROTOCOL,
  E7_OBSERVER_LABELS,
  CLICK_PAIN_LABELS,
  E8_LOCKING_TYPE_DESCRIPTIONS,
  JOINT_SOUND_KEYS,
  JOINT_SOUND_LABELS,
  getSectionBadge,
  PALPATION_SITES,
  SECTION_LABELS,
  REGIONS,
  SIDES,
  SITE_CONFIG,
  SITES_BY_GROUP,
  getValueAtPath as get,
  type JointSound,
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
import { BilateralLayout, FindingRow, InlineField } from "./findings-primitives";

// ── Main component ──────────────────────────────────────────────────

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
    [criteriaData],
  );

  const content = (
    <Tabs defaultValue="pain">
      <TabsList className="flex-wrap h-auto">
        {SQ_SECTIONS.map((section) => (
          <TabsTrigger key={section.id} value={section.id}>
            {section.name}
          </TabsTrigger>
        ))}
        <TabsTrigger value="measurements">Funktionsanalyse</TabsTrigger>
      </TabsList>

      {SQ_SECTIONS.map((section) => (
        <TabsContent key={section.id} value={section.id}>
          <SQSectionQuestions section={section} sqData={sqData} />
          {section.id === "pain" && <PainFindingsContent criteriaData={criteriaData} />}
          {section.id === "headache" && <HeadacheFindingsContent criteriaData={criteriaData} />}
          {section.id === "joint_noises" && (
            <JointSoundFindingsContent criteriaData={criteriaData} />
          )}
          {section.id === "closed_locking" && (
            <LockingFindingsContent
              criteriaData={criteriaData}
              lockingType="closedLocking"
              title="Kieferklemme (während der Öffnung)"
            />
          )}
          {section.id === "open_locking" && (
            <LockingFindingsContent
              criteriaData={criteriaData}
              lockingType="openLocking"
              title="Kiefersperre (bei weiter Mundöffnung)"
            />
          )}
        </TabsContent>
      ))}

      <TabsContent value="measurements">
        <MeasurementsFindingsContent criteriaData={criteriaData} />
      </TabsContent>
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

// ── SQ question rendering ───────────────────────────────────────────

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

function formatSideLabel(office: unknown): string | null {
  if (!office || typeof office !== "object") return null;
  const o = office as { R?: boolean; L?: boolean; DNK?: boolean };
  if (o.DNK) return "Seite unbestimmt";
  const sides: string[] = [];
  if (o.R) sides.push("Rechte Seite");
  if (o.L) sides.push("Linke Seite");
  return sides.length > 0 ? sides.join(", ") : null;
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
        const sideLabel = enabled && value === "yes" ? formatSideLabel(sqData[`${qId}_office`]) : null;

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
            {sideLabel && (
              <span className="text-muted-foreground whitespace-nowrap">({sideLabel})</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Pain findings ───────────────────────────────────────────────────

const CORE_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];
const EXTRA_REGIONS: readonly Region[] = ["otherMast", "nonMast"];

function PainFindingsContent({ criteriaData }: { criteriaData: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState<{ side: Side; region: Region } | null>(null);
  const [showAllRegions, setShowAllRegions] = useState(false);

  const toggleRegion = useCallback((side: Side, region: Region) => {
    setExpanded((prev) =>
      prev?.side === side && prev?.region === region ? null : { side, region },
    );
  }, []);

  const painLocations = useMemo(() => {
    const toRegions = (v: unknown): Region[] | undefined => {
      if (!Array.isArray(v) || v.length === 0) return undefined;
      return v as Region[];
    };
    return {
      right: toRegions(get(criteriaData, "e1.painLocation.right")),
      left: toRegions(get(criteriaData, "e1.painLocation.left")),
    };
  }, [criteriaData]);

  const visibleRegions: readonly Region[] = showAllRegions
    ? [...CORE_REGIONS, ...EXTRA_REGIONS]
    : CORE_REGIONS;

  // Neutral statuses — no highlighting, diagrams serve as anatomical reference only
  const neutralStatuses: Partial<Record<Region, RegionStatus>> = {};
  for (const r of visibleRegions) {
    if (r !== "otherMast") neutralStatuses[r] = EMPTY_REGION_STATUS;
  }

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
              regions={visibleRegions.filter((r) => r !== "otherMast")}
              regionStatuses={neutralStatuses}
              selectedRegion={
                expanded?.side === side && expanded.region !== "otherMast"
                  ? expanded.region
                  : null
              }
              onRegionClick={(region) => toggleRegion(side, region)}
              hideBackgroundImages
              className="w-full max-w-[180px]"
            />
            <div className="w-full space-y-1 pt-1">
              <div className="text-xs font-medium">{SIDES[side]}</div>
              {visibleRegions.map((region) => {
                const isPainPositive = painLocations[side]?.includes(region) ?? false;
                const isExpanded = expanded?.side === side && expanded?.region === region;
                return (
                  <div
                    key={region}
                    className={cn(
                      "border rounded border-l-2 border-l-muted-foreground/30",
                      isExpanded && "bg-muted/30",
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
                        <FindingRow
                          badge="U1A"
                          label="Schmerzlokalisation bestätigt"
                          value={
                            painLocations[side] === undefined
                              ? "—"
                              : isPainPositive
                                ? "Ja"
                                : "Nein"
                          }
                          className="mt-0.5"
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <PainRegionDetail
                        criteriaData={criteriaData}
                        side={side}
                        region={region}
                      />
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

// ── Pain region detail ──────────────────────────────────────────────

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

  return (
    <div className="space-y-1.5 pl-[26px] pr-2 pb-2">
      {/* U4B/U4C — opening pain */}
      {!isSupplemental &&
        E4_PAIN_STEPS.map(({ key, badge }) => (
          <div key={key} className="flex items-baseline gap-1.5 text-xs flex-wrap">
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {badge}
            </Badge>
            <InlineField
              label="Schmerz"
              value={translateValue(get(criteriaData, `e4.${key}.${side}.${region}.pain`))}
            />
            <InlineField
              label="Bek. Schmerz"
              value={translateValue(get(criteriaData, `e4.${key}.${side}.${region}.familiarPain`))}
            />
          </div>
        ))}

      {/* U5A/U5B/U5C — lateral/protrusive pain */}
      {!isSupplemental &&
        E5_STEPS.map(({ key, badge }) => (
          <div key={key} className="flex items-baseline gap-1.5 text-xs flex-wrap">
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {badge}
            </Badge>
            <InlineField
              label="Schmerz"
              value={translateValue(get(criteriaData, `e5.${key}.${side}.${region}.pain`))}
            />
            <InlineField
              label="Bek. Schmerz"
              value={translateValue(get(criteriaData, `e5.${key}.${side}.${region}.familiarPain`))}
            />
          </div>
        ))}

      {/* Palpation cards */}
      {palpationSites.length > 0 && (
        <div className="space-y-1">
          <FindingRow badge={palpationBadge} label="Palpation" value="" />
          <div className="space-y-1">
            {palpationSites.map((s) => (
              <div key={s} className="border rounded p-1.5 text-xs space-y-0.5">
                <div className="font-medium text-muted-foreground">{PALPATION_SITES[s]}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  <InlineField
                    label="Schmerz"
                    value={translateValue(get(criteriaData, `${palpationSection}.${side}.${s}.pain`))}
                  />
                  <InlineField
                    label="Bek. Schmerz"
                    value={translateValue(
                      get(criteriaData, `${palpationSection}.${side}.${s}.familiarPain`),
                    )}
                  />
                  {showSpreading && SITE_CONFIG[s].hasSpreading && (
                    <InlineField
                      label="Ausbr. Schmerz"
                      value={translateValue(
                        get(criteriaData, `${palpationSection}.${side}.${s}.spreadingPain`),
                      )}
                    />
                  )}
                  <InlineField
                    label="Übertr. Schmerz"
                    value={translateValue(
                      get(criteriaData, `${palpationSection}.${side}.${s}.referredPain`),
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Headache findings ───────────────────────────────────────────────

const TEMPORALIS_SITES = SITES_BY_GROUP["temporalis"];

function HeadacheFindingsContent({ criteriaData }: { criteriaData: Record<string, unknown> }) {
  const headacheLocations = useMemo(() => {
    const toRegions = (v: unknown): Region[] | undefined => {
      if (!Array.isArray(v) || v.length === 0) return undefined;
      return v as Region[];
    };
    return {
      right: toRegions(get(criteriaData, "e1.headacheLocation.right")),
      left: toRegions(get(criteriaData, "e1.headacheLocation.left")),
    };
  }, [criteriaData]);

  return (
    <BilateralLayout title="Untersuchungsbefunde Kopfschmerz">
      {(side) => {
        const hasHeadache = headacheLocations[side]?.includes("temporalis") ?? false;
        return (
          <div className="space-y-1.5">
            <FindingRow
              badge="U1B"
              label="Kopfschmerzlokalisation Temporalis"
              value={headacheLocations[side] === undefined ? "—" : hasHeadache ? "Ja" : "Nein"}
            />
            {E4_PAIN_STEPS.map(({ key, badge }) => (
              <FindingRow
                key={key}
                badge={badge}
                label="Bek. Kopfschmerz"
                value={translateValue(
                  get(criteriaData, `e4.${key}.${side}.temporalis.familiarHeadache`),
                )}
              />
            ))}
            {E5_STEPS.map(({ key, badge }) => (
              <FindingRow
                key={key}
                badge={badge}
                label="Bek. Kopfschmerz"
                value={translateValue(
                  get(criteriaData, `e5.${key}.${side}.temporalis.familiarHeadache`),
                )}
              />
            ))}
            <div className="space-y-1">
              <FindingRow badge="U9" label="Palpation — Bek. Kopfschmerz" value="" />
              {TEMPORALIS_SITES.map((s) => (
                <div key={s} className="border rounded p-1.5 text-xs">
                  <div className="font-medium text-muted-foreground">{PALPATION_SITES[s]}</div>
                  <span className="font-medium">
                    {translateValue(get(criteriaData, `e9.${side}.${s}.familiarHeadache`))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </BilateralLayout>
  );
}

// ── Joint sound findings ────────────────────────────────────────────

function JointSoundCard({
  badge,
  soundType,
  fields,
  criteriaData,
  side,
}: {
  badge: string;
  soundType: JointSound;
  fields: { key: string; label: string }[];
  criteriaData: Record<string, unknown>;
  side: Side;
}) {
  const section = badge === "U6" ? "e6" : "e7";
  return (
    <div className="border rounded p-1.5 text-xs space-y-0.5">
      <FindingRow badge={badge} label={JOINT_SOUND_LABELS[soundType]} value="" />
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {fields.map(({ key, label }) => (
          <InlineField
            key={key}
            label={label}
            value={translateValue(get(criteriaData, `${section}.${side}.${soundType}.${key}`))}
          />
        ))}
      </div>
      {soundType === "click" && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
          <InlineField
            label={CLICK_PAIN_LABELS.painWithClick}
            value={translateValue(get(criteriaData, `${section}.${side}.click.painWithClick`))}
          />
          <InlineField
            label={CLICK_PAIN_LABELS.familiarPain}
            value={translateValue(get(criteriaData, `${section}.${side}.click.familiarPain`))}
          />
        </div>
      )}
    </div>
  );
}

const E6_FIELDS = (Object.keys(E6_OBSERVER_LABELS) as (keyof typeof E6_OBSERVER_LABELS)[]).map(
  (key) => ({ key, label: E6_OBSERVER_LABELS[key] }),
);
const E7_FIELDS = (Object.keys(E7_OBSERVER_LABELS) as (keyof typeof E7_OBSERVER_LABELS)[]).map(
  (key) => ({ key, label: E7_OBSERVER_LABELS[key] }),
);

function JointSoundFindingsContent({ criteriaData }: { criteriaData: Record<string, unknown> }) {
  return (
    <BilateralLayout title="Untersuchungsbefunde Gelenkgeräusche">
      {(side) => (
        <div className="space-y-1">
          {JOINT_SOUND_KEYS.map((st) => (
            <JointSoundCard
              key={`u6-${st}`}
              badge="U6"
              soundType={st}
              fields={E6_FIELDS}
              criteriaData={criteriaData}
              side={side}
            />
          ))}
          {JOINT_SOUND_KEYS.map((st) => (
            <JointSoundCard
              key={`u7-${st}`}
              badge="U7"
              soundType={st}
              fields={E7_FIELDS}
              criteriaData={criteriaData}
              side={side}
            />
          ))}
        </div>
      )}
    </BilateralLayout>
  );
}

// ── Locking findings ────────────────────────────────────────────────

function LockingFindingsContent({
  criteriaData,
  lockingType,
  title,
}: {
  criteriaData: Record<string, unknown>;
  lockingType: "closedLocking" | "openLocking";
  title: string;
}) {
  return (
    <BilateralLayout title={title}>
      {(side) => (
        <div className="border rounded p-1.5 text-xs space-y-0.5">
          <FindingRow badge="U8" label={E8_LOCKING_TYPE_DESCRIPTIONS[lockingType]} value="" />
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            <InlineField
              label="Blockade"
              value={translateValue(get(criteriaData, `e8.${side}.${lockingType}.locking`))}
            />
            <InlineField
              label="Lösbar durch Patient"
              value={translateValue(
                get(criteriaData, `e8.${side}.${lockingType}.reducibleByPatient`)
              )}
            />
            <InlineField
              label="Lösbar durch Untersucher"
              value={translateValue(
                get(criteriaData, `e8.${side}.${lockingType}.reducibleByExaminer`)
              )}
            />
          </div>
        </div>
      )}
    </BilateralLayout>
  );
}

// ── Measurements findings content ─────────────────────────────────────

function formatMm(value: unknown): string {
  if (value == null) return "—";
  return `${value} mm`;
}

function MeasurementsFindingsContent({ criteriaData }: { criteriaData: Record<string, unknown> }) {
  return (
    <div className="space-y-4 pt-2">
      {/* U2 — Schneidekantenverhältnisse */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {getSectionBadge("e2")} — {SECTION_LABELS.e2.full}
        </div>
        <FindingRow
          badge={getSectionBadge("e2")}
          label="Referenzzahn"
          value={translateValue(get(criteriaData, "e2.referenceTooth.selection"))}
        />
        <FindingRow
          badge={getSectionBadge("e2")}
          label="Horizontaler Überbiss"
          value={formatMm(get(criteriaData, "e2.horizontalOverjet"))}
        />
        <FindingRow
          badge={getSectionBadge("e2")}
          label="Vertikaler Überbiss"
          value={formatMm(get(criteriaData, "e2.verticalOverlap"))}
        />
        <FindingRow
          badge={getSectionBadge("e2")}
          label="Mittellinienabweichung"
          value={(() => {
            const dir = get(criteriaData, "e2.midlineDeviation.direction") as string | undefined;
            const mm = get(criteriaData, "e2.midlineDeviation.mm");
            if (!dir || dir === "na") return dir ? (E2_MIDLINE_DIRECTIONS as Record<string, string>)[dir] ?? "—" : "—";
            const dirLabel = (E2_MIDLINE_DIRECTIONS as Record<string, string>)[dir] ?? dir;
            return mm != null ? `${dirLabel}, ${mm} mm` : dirLabel;
          })()}
        />
      </div>

      {/* U3 — Öffnungsmuster */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {getSectionBadge("e3")} — {SECTION_LABELS.e3.full}
        </div>
        <FindingRow
          badge={getSectionBadge("e3")}
          label="Öffnungsmuster"
          value={(() => {
            const pattern = get(criteriaData, "e3.pattern") as string | undefined;
            if (!pattern) return "—";
            return (E3_OPENING_PATTERNS as Record<string, string>)[pattern] ?? pattern;
          })()}
        />
      </div>

      {/* U4 — Öffnungsbewegungen */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {getSectionBadge("e4")} — {SECTION_LABELS.e4.full}
        </div>
        {EXAMINATION_PROTOCOL.e4.steps.map((step) => {
          const measurement = get(criteriaData, `e4.${step.key}.measurement`);
          const terminated = step.key === "maxAssisted" && get(criteriaData, "e4.maxAssisted.terminated") === true;
          return (
            <FindingRow
              key={step.key}
              badge={step.badge}
              label={step.label}
              value={terminated ? `${formatMm(measurement)} (abgebrochen)` : formatMm(measurement)}
            />
          );
        })}
      </div>

      {/* U5 — Lateralbewegungen */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {getSectionBadge("e5")} — {SECTION_LABELS.e5.full}
        </div>
        {EXAMINATION_PROTOCOL.e5.steps.map((step) => (
          <FindingRow
            key={step.key}
            badge={step.badge}
            label={step.label}
            value={formatMm(get(criteriaData, `e5.${step.key}.measurement`))}
          />
        ))}
      </div>
    </div>
  );
}
