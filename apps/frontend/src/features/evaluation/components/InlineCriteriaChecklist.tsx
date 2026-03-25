/**
 * InlineCriteriaChecklist — Single-column criteria list for inline use
 * within a diagnosis row. Shows criteria with inline source data,
 * state toggles, and mismatch warnings.
 *
 * Evaluates the diagnosis internally, then renders Anamnese and
 * Untersuchung sections with per-criterion state buttons.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  evaluateDiagnosis,
  getLocationResult,
  type CriterionResult,
  type DiagnosisDefinition,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { AlertTriangle, CheckCircle2, CircleHelp, Info, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import type { CriteriaAssessment, CriterionUserState } from "../types";
import { getDisplayGroups } from "../utils/criterion-data-display";
import { extractChecklistItems, type ChecklistItem } from "../utils/extract-criteria-items";

// ── Helpers ─────────────────────────────────────────────────────────

function isMismatch(userState: CriterionUserState | undefined, result: CriterionResult): boolean {
  return userState !== undefined && userState !== result.status;
}

const STATE_OPTIONS = [
  {
    state: "positive" as const,
    label: "Ja",
    Icon: CheckCircle2,
    activeClass: "bg-blue-100 border-blue-400 text-blue-700",
  },
  {
    state: "negative" as const,
    label: "Nein",
    Icon: XCircle,
    activeClass: "bg-gray-100 border-gray-400 text-gray-600",
  },
  {
    state: "pending" as const,
    label: "Unklar",
    Icon: CircleHelp,
    activeClass: "bg-amber-100 border-amber-400 text-amber-700",
  },
] as const;

// ── Sub-components ──────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-3 pb-1 px-3">
      {label}
    </div>
  );
}

/** Render flat source data lines for all source types (SF + U). */
function SourceDataLines({
  sources,
  criteriaData,
  side,
  region,
  site,
}: {
  sources: string[];
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
  site?: PalpationSite;
}) {
  const groups = useMemo(
    () => getDisplayGroups(sources, criteriaData, side, region, site),
    [sources, criteriaData, side, region, site]
  );

  if (groups.length === 0)
    return <p className="text-xs text-muted-foreground">Keine Daten verfügbar.</p>;

  return (
    <div className="space-y-1">
      {groups.map((group, i) => (
        <div key={i} className="flex items-baseline gap-1.5 text-xs">
          <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
            {group.badge}
          </Badge>
          <span className="text-muted-foreground">{group.headline}:</span>
          <span className="font-medium whitespace-nowrap">{group.value}</span>
        </div>
      ))}
    </div>
  );
}

function InlineCriterionRow({
  item,
  userState,
  onStateChange,
  criteriaData,
  side,
  region,
  site,
  readOnly,
}: {
  item: ChecklistItem;
  userState: CriterionUserState | undefined;
  onStateChange: (key: string, state: CriterionUserState) => void;
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
  site?: PalpationSite;
  readOnly?: boolean;
}) {
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const allSources = useMemo(() => item.sources ?? [], [item.sources]);
  const hasSources = allSources.length > 0;
  const mismatch = isMismatch(userState, item.result);

  const activeSources = useMemo(
    () => (activeBadge ? allSources.filter((s) => s === activeBadge) : []),
    [allSources, activeBadge]
  );

  function toggleBadge(source: string) {
    setActiveBadge((prev) => (prev === source ? null : source));
  }

  return (
    <div>
      <div className="flex items-start gap-2 py-2 px-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 flex-1 min-w-0">
          <span className="text-sm font-medium">{item.label}</span>

          {/* Source badges */}
          {hasSources && (
            <span className="flex items-center gap-1 shrink-0">
              {allSources.map((s) =>
                readOnly ? (
                  <Badge
                    key={s}
                    variant="outline"
                    className="text-xs px-1.5 py-0 font-mono"
                  >
                    {s}
                  </Badge>
                ) : (
                  <button key={s} type="button" onClick={() => toggleBadge(s)}>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-1.5 py-0 font-mono transition-colors",
                        activeBadge === s
                          ? "bg-primary/10 border-primary/50 text-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      {s}
                    </Badge>
                  </button>
                )
              )}
            </span>
          )}
        </div>

        {/* State buttons */}
        {!readOnly && (
          <div className="flex gap-1 shrink-0">
            {STATE_OPTIONS.map(({ state, label, Icon, activeClass }) => (
              <button
                key={state}
                type="button"
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors",
                  userState === state
                    ? activeClass
                    : "border-border text-muted-foreground hover:bg-muted/50"
                )}
                onClick={() => onStateChange(item.key, state)}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Read-only state display */}
        {readOnly && userState && (
          <span
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-xs border shrink-0",
              STATE_OPTIONS.find((o) => o.state === userState)?.activeClass
            )}
          >
            {(() => {
              const opt = STATE_OPTIONS.find((o) => o.state === userState);
              if (!opt) return null;
              return (
                <>
                  <opt.Icon className="h-3 w-3" />
                  {opt.label}
                </>
              );
            })()}
          </span>
        )}

        {/* Mismatch warning */}
        {mismatch && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
      </div>

      {/* Mismatch description */}
      {mismatch && (
        <div className="px-3 pb-1">
          <p className="text-xs text-amber-700">
            Ihre Angabe weicht von den erfassten Befunden ab.
          </p>
        </div>
      )}

      {/* Source data for active badges */}
      {activeSources.length > 0 && (
        <div className="px-3 pb-3 pl-6">
          <SourceDataLines
            sources={activeSources}
            criteriaData={criteriaData}
            side={side}
            region={region}
            site={site}
          />
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────

interface InlineCriteriaChecklistProps {
  diagnosis: DiagnosisDefinition;
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
  site?: PalpationSite;
  assessmentMap: Map<string, CriteriaAssessment>;
  onAssessmentChange: (item: ChecklistItem, state: CriterionUserState) => void;
  onAssessmentClear: (item: ChecklistItem) => void;
  readOnly?: boolean;
  requirementMet?: boolean;
}

export function InlineCriteriaChecklist({
  diagnosis,
  criteriaData,
  side,
  region,
  site,
  assessmentMap,
  onAssessmentChange,
  onAssessmentClear,
  readOnly,
  requirementMet,
}: InlineCriteriaChecklistProps) {
  // ── Evaluate ────────────────────────────────────────────────────
  const evalResult = useMemo(
    () => evaluateDiagnosis(diagnosis, criteriaData),
    [diagnosis, criteriaData]
  );

  const locationResult = useMemo(
    () => getLocationResult(evalResult, side, region, site),
    [evalResult, side, region, site]
  );

  // ── Extract items ───────────────────────────────────────────────
  const anamnesisItems = useMemo(
    () =>
      extractChecklistItems(evalResult.anamnesisResult, {
        side: null,
        region: null,
        site: null,
      }),
    [evalResult.anamnesisResult]
  );

  const sidedAnamnesisItems = useMemo(() => {
    if (!locationResult?.sidedAnamnesisResult) return null;
    return extractChecklistItems(locationResult.sidedAnamnesisResult, {
      side,
      region: null,
      site: null,
    });
  }, [locationResult, side]);

  const examinationItems = useMemo(() => {
    if (!locationResult) return [];
    return extractChecklistItems(locationResult.examinationResult, {
      side,
      region,
      site: site ?? null,
    });
  }, [locationResult, side, region, site]);

  // ── User states ────────────────────────────────────────────────
  const userStates = useMemo(() => {
    const states: Record<string, CriterionUserState> = {};
    for (const [key, assessment] of assessmentMap) {
      states[key] = assessment.state;
    }
    return states;
  }, [assessmentMap]);

  // ── Handlers ───────────────────────────────────────────────────
  const allItems = [...anamnesisItems, ...(sidedAnamnesisItems ?? []), ...examinationItems];

  function handleStateChange(key: string, state: CriterionUserState) {
    const item = allItems.find((i) => i.key === key);
    if (!item) return;
    if (userStates[key] === state) {
      onAssessmentClear(item);
    } else {
      onAssessmentChange(item, state);
    }
  }

  const hasRequiresConstraint = !!diagnosis.requires;

  return (
    <div className="divide-y">
      {/* Anamnesis section */}
      <div>
        <SectionHeader label="Anamnese" />
        {anamnesisItems.map((item) => (
          <InlineCriterionRow
            key={item.key}
            item={item}
            userState={userStates[item.key]}
            onStateChange={handleStateChange}
            criteriaData={criteriaData}
            side={side}
            region={region}
            site={site}
            readOnly={readOnly}
          />
        ))}
        {sidedAnamnesisItems?.map((item) => (
          <InlineCriterionRow
            key={item.key}
            item={item}
            userState={userStates[item.key]}
            onStateChange={handleStateChange}
            criteriaData={criteriaData}
            side={side}
            region={region}
            site={site}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Examination section */}
      <div>
        <SectionHeader label="Untersuchung" />
        {examinationItems.map((item) => (
          <InlineCriterionRow
            key={item.key}
            item={item}
            userState={userStates[item.key]}
            onStateChange={handleStateChange}
            criteriaData={criteriaData}
            side={side}
            region={region}
            site={site}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Cross-diagnosis requirement alert */}
      {hasRequiresConstraint && (
        <div className="px-3 py-3">
          <Alert
            className={requirementMet === false ? "bg-amber-50/50 border-amber-200" : "bg-muted/50"}
          >
            {requirementMet === false ? (
              <AlertTriangle className="text-amber-500" />
            ) : (
              <Info className="text-muted-foreground" />
            )}
            <AlertDescription
              className={requirementMet === false ? "text-amber-900" : "text-muted-foreground"}
            >
              {requirementMet === false
                ? "Voraussetzung: Myalgie oder Arthralgie muss ebenfalls positiv sein. Derzeit nicht erfüllt."
                : "Voraussetzung: Myalgie oder Arthralgie muss ebenfalls positiv sein."}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
