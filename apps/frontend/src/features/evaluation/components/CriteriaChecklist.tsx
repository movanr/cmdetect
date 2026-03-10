/**
 * CriteriaChecklist — Renders a table-like checklist of diagnostic criteria
 * for a single diagnosis at a specific side + region.
 *
 * Alternative to the decision tree view. Shows anamnesis, sided anamnesis,
 * and examination criteria with their evaluation status at a glance.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  evaluateDiagnosis,
  getCriterionId,
  getCriterionLabel,
  getCriterionSources,
  getLocationResult,
  isCompositeResult,
  PALPATION_SITES,
  REGIONS,
  SIDES,
  type CriterionResult,
  type DiagnosisDefinition,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  CircleMinus,
  Info,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { CriteriaAssessment, CriterionUserState } from "../types";
import { assessmentKey } from "../utils/assessment-key";
import { getDisplayGroups } from "../utils/criterion-data-display";

function isMismatch(
  userState: CriterionUserState | undefined,
  result: CriterionResult
): boolean {
  return userState !== undefined && userState !== result.status;
}

interface CriteriaChecklistProps {
  diagnosis: DiagnosisDefinition;
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
  site?: PalpationSite;
  titleSlot?: ReactNode;
  isDocumented?: boolean;
  onConfirm?: (diagnosisId: string, note: string | null) => void;
  readOnly?: boolean;
  /** Whether cross-diagnosis requirement is met (for headache) */
  requirementMet?: boolean;
  assessmentMap: Map<string, CriteriaAssessment>;
  onAssessmentChange: (item: ChecklistItem, state: CriterionUserState) => void;
  onAssessmentClear: (item: ChecklistItem) => void;
}

export interface ChecklistItem {
  key: string;
  criterionId: string;
  assessmentSide: Side | null;
  assessmentRegion: Region | null;
  assessmentSite: PalpationSite | null;
  label: string;
  detail?: string;
  sources?: string[];
  result: CriterionResult;
}

// ── Helpers ─────────────────────────────────────────────────────────

interface ChecklistItemScope {
  side: Side | null;
  region: Region | null;
  site: PalpationSite | null;
}

function extractChecklistItems(
  result: CriterionResult,
  fallbackLabel: string,
  prefix: string,
  scope: ChecklistItemScope,
): ChecklistItem[] {
  if (isCompositeResult(result) && result.criterion.type === "and") {
    return result.children.map((child, i) => {
      const id = getCriterionId(child.criterion) ?? `${prefix}-${i}`;
      return {
        key: assessmentKey(id, scope.side, scope.region, scope.site),
        criterionId: id,
        assessmentSide: scope.side,
        assessmentRegion: scope.region,
        assessmentSite: scope.site,
        label: getCriterionLabel(child.criterion) ?? fallbackLabel,
        sources: getCriterionSources(child.criterion),
        result: child,
      };
    });
  }
  const id = getCriterionId(result.criterion) ?? prefix;
  return [
    {
      key: assessmentKey(id, scope.side, scope.region, scope.site),
      criterionId: id,
      assessmentSide: scope.side,
      assessmentRegion: scope.region,
      assessmentSite: scope.site,
      label: getCriterionLabel(result.criterion) ?? fallbackLabel,
      sources: getCriterionSources(result.criterion),
      result,
    },
  ];
}

function StateIcon({ state }: { state: CriterionUserState | undefined }) {
  if (state === "positive")
    return <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />;
  if (state === "negative") return <XCircle className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />;
  if (state === "pending")
    return <CircleHelp className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />;
  return <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />;
}

// ── Sub-components ──────────────────────────────────────────────────

function ChecklistRow({
  item,
  isSelected,
  userState,
  onClick,
}: {
  item: ChecklistItem;
  isSelected: boolean;
  userState: CriterionUserState | undefined;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2 px-3 cursor-pointer",
        isSelected ? "bg-muted" : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <span className="text-sm flex-1">
        {item.label}
        {item.detail && <span className="font-normal text-muted-foreground"> ({item.detail})</span>}
      </span>
      {item.sources?.map((s) => (
        <Badge key={s} variant="outline" className="text-xs px-1.5 py-0 font-mono shrink-0">
          {s}
        </Badge>
      ))}
      {isMismatch(userState, item.result) && (
        <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
      )}
      <StateIcon state={userState} />
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-3 pb-1 px-3">
      {label}
    </div>
  );
}

const STATE_OPTIONS = [
  {
    state: "positive" as const,
    label: "Positiv",
    Icon: CheckCircle2,
    activeClass: "bg-blue-100 border-blue-400 text-blue-700",
  },
  {
    state: "negative" as const,
    label: "Negativ",
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

function CriterionDataDisplay({
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
    <div className="space-y-3">
      {groups.map((group, i) =>
        group.cards.length === 0 ? (
          <div key={i} className="flex items-baseline gap-1.5 text-xs">
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {group.badge}
            </Badge>
            <span className="text-muted-foreground">{group.headline}:</span>
            <span className="font-medium whitespace-nowrap">{group.value}</span>
          </div>
        ) : (
          <div key={i}>
            <div className="flex items-center gap-1.5 text-xs mb-1.5">
              <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
                {group.badge}
              </Badge>
              <span className="font-medium">{group.headline}</span>
            </div>
            <div className="space-y-1.5 ml-1">
              {group.cards.map((card, j) => (
                <div key={j} className="border rounded-md px-3 py-2 bg-muted/30">
                  <div className="text-xs font-medium mb-1">{card.title}</div>
                  {card.entries.map((entry, k) => (
                    <div key={k} className="flex items-baseline gap-1.5 text-xs">
                      <span className="text-muted-foreground">{entry.label}:</span>
                      <span className="font-medium whitespace-nowrap">{entry.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function CriteriaItemDetail({
  item,
  userState,
  onStateChange,
  criteriaData,
  side,
  region,
  site,
}: {
  item: ChecklistItem;
  userState: CriterionUserState | undefined;
  onStateChange: (key: string, state: CriterionUserState) => void;
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
  site?: PalpationSite;
}) {
  const { result } = item;
  return (
    <div className="p-4 space-y-4 text-sm">
      <h4 className="font-semibold">
        {item.label}
        {item.detail && (
          <span className="font-normal text-muted-foreground"> ({item.detail})</span>
        )}
      </h4>

      {/* State toggle */}
      <div className="flex gap-2">
        {STATE_OPTIONS.map(({ state, label, Icon, activeClass }) => (
          <button
            key={state}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition-colors",
              userState === state
                ? activeClass
                : "border-border text-muted-foreground hover:bg-muted/50"
            )}
            onClick={() => onStateChange(item.key, state)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Mismatch warning */}
      {isMismatch(userState, result) && (
        <Alert className="bg-amber-50/50 border-amber-200 py-2">
          <AlertTriangle className="text-amber-500 h-4 w-4" />
          <AlertDescription className="text-amber-900 text-xs">
            Ihre Angabe weicht von den erfassten Befunden ab.
          </AlertDescription>
        </Alert>
      )}

      <CriterionDataDisplay
        sources={item.sources ?? []}
        criteriaData={criteriaData}
        side={side}
        region={region}
        site={site}
      />
    </div>
  );
}

export function CriteriaChecklist({
  diagnosis,
  criteriaData,
  side,
  region,
  site,
  titleSlot,
  isDocumented,
  onConfirm,
  readOnly,
  requirementMet,
  assessmentMap,
  onAssessmentChange,
  onAssessmentClear,
}: CriteriaChecklistProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const evalResult = useMemo(
    () => evaluateDiagnosis(diagnosis, criteriaData),
    [diagnosis, criteriaData]
  );

  const locationResult = useMemo(
    () => getLocationResult(evalResult, side, region, site),
    [evalResult, side, region, site]
  );

  // Extract checklist items with scope for assessment key generation
  const anamnesisItems = useMemo(
    () =>
      extractChecklistItems(evalResult.anamnesisResult, "Anamnese", "anamnesis", {
        side: null,
        region: null,
        site: null,
      }),
    [evalResult.anamnesisResult]
  );

  const sidedAnamnesisItems = useMemo(() => {
    if (!locationResult?.sidedAnamnesisResult) return null;
    return extractChecklistItems(
      locationResult.sidedAnamnesisResult,
      "Anamnese",
      `sided-anamnesis:${side}`,
      { side, region: null, site: null },
    );
  }, [locationResult, side]);

  const examinationItems = useMemo(() => {
    if (!locationResult) return [];
    return extractChecklistItems(
      locationResult.examinationResult,
      "Untersuchungsbefund",
      `examination:${side}:${region}`,
      { side, region, site: site ?? null },
    );
  }, [locationResult, side, region, site]);

  // Add localisation details to items
  const sideDetail = SIDES[side];
  const locationLabel = site ? PALPATION_SITES[site] : REGIONS[region];

  const sidedAnamnesisItemsWithDetail = useMemo(
    () => sidedAnamnesisItems?.map((item) => ({ ...item, detail: sideDetail })) ?? null,
    [sidedAnamnesisItems, sideDetail]
  );

  const examinationItemsWithDetail = useMemo(
    () => examinationItems.map((item) => ({ ...item, detail: `${locationLabel}, ${sideDetail}` })),
    [examinationItems, locationLabel, sideDetail]
  );

  const userStates = useMemo(() => {
    const states: Record<string, CriterionUserState> = {};
    for (const [key, assessment] of assessmentMap) {
      states[key] = assessment.state;
    }
    return states;
  }, [assessmentMap]);

  // Derive selectedItem — keep selection stable across localisation/diagnosis changes
  // if the same item key still exists in the current list
  const allItems = [
    ...anamnesisItems,
    ...(sidedAnamnesisItemsWithDetail ?? []),
    ...examinationItemsWithDetail,
  ];
  const selectedItem = (selectedKey ? allItems.find((i) => i.key === selectedKey) : null)
    ?? allItems[0] ?? null;

  function selectItem(item: ChecklistItem) {
    setSelectedKey(item.key);
  }

  const isConfirmed = isDocumented === true;
  const hasRequiresConstraint = !!diagnosis.requires;

  function handleStateChange(key: string, state: CriterionUserState) {
    const item = allItems.find((i) => i.key === key);
    if (!item) return;
    if (userStates[key] === state) {
      onAssessmentClear(item);
    } else {
      onAssessmentChange(item, state);
    }
  }

  const listClass = selectedItem ? "w-[28rem] shrink-0" : "flex-1";

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header — split to match body columns */}
      <div className={`flex divide-x border-b ${isConfirmed ? "bg-blue-50" : "bg-gray-50"}`}>
        <div className={`flex items-center gap-2 px-4 py-3 min-w-0 ${listClass}`}>
          {titleSlot ?? <h3 className="text-sm font-semibold">{diagnosis.nameDE}</h3>}
          <Badge variant="outline" className="text-xs font-normal bg-background shrink-0">
            {locationLabel}, {sideDetail}
          </Badge>
          {isConfirmed && (
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5 font-medium text-blue-700 border-blue-300 bg-blue-100 ml-auto"
            >
              Bestätigt
            </Badge>
          )}
        </div>
        {selectedItem && (
          <div className="flex items-center px-4 py-3 flex-1 min-w-0">
            <h3 className="text-sm font-semibold">Befunde</h3>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex divide-x">
        {/* Left: checklist list */}
        <div className={listClass}>
          <div className="divide-y">
            {/* Anamnesis section (includes sided anamnesis items) */}
            <div>
              <SectionHeader label="Anamnese" />
              {anamnesisItems.map((item) => (
                <ChecklistRow
                  key={item.key}
                  item={item}
                  isSelected={selectedItem?.key === item.key}
                  userState={userStates[item.key]}
                  onClick={() => selectItem(item)}
                />
              ))}
              {sidedAnamnesisItemsWithDetail?.map((item) => (
                <ChecklistRow
                  key={item.key}
                  item={item}
                  isSelected={selectedItem?.key === item.key}
                  userState={userStates[item.key]}
                  onClick={() => selectItem(item)}
                />
              ))}
            </div>

            {/* Examination section */}
            <div>
              <SectionHeader label="Untersuchung" />
              {examinationItemsWithDetail.map((item) => (
                <ChecklistRow
                  key={item.key}
                  item={item}
                  isSelected={selectedItem?.key === item.key}
                  userState={userStates[item.key]}
                  onClick={() => selectItem(item)}
                />
              ))}
            </div>

            {/* Cross-diagnosis requirement alert */}
            {hasRequiresConstraint && (
              <div className="px-3 py-3">
                <Alert
                  className={
                    requirementMet === false ? "bg-amber-50/50 border-amber-200" : "bg-muted/50"
                  }
                >
                  {requirementMet === false ? (
                    <AlertTriangle className="text-amber-500" />
                  ) : (
                    <Info className="text-muted-foreground" />
                  )}
                  <AlertDescription
                    className={
                      requirementMet === false ? "text-amber-900" : "text-muted-foreground"
                    }
                  >
                    {requirementMet === false
                      ? "Voraussetzung: Myalgie oder Arthralgie muss ebenfalls positiv sein. Derzeit nicht erfüllt."
                      : "Voraussetzung: Myalgie oder Arthralgie muss ebenfalls positiv sein."}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Confirm/reject button */}
            {!readOnly && onConfirm && (
              <div className="px-4 py-3">
                <Button
                  size="sm"
                  className="w-full"
                  variant={isConfirmed ? "outline" : "default"}
                  onClick={() => onConfirm(diagnosis.id, null)}
                >
                  {isConfirmed ? (
                    <>
                      <CircleMinus className="mr-2 h-4 w-4" />
                      Diagnose aufheben
                    </>
                  ) : (
                    <>Diagnose dokumentieren</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        {selectedItem && (
          <div className="flex-1 min-w-0">
            <CriteriaItemDetail
              item={selectedItem}
              userState={userStates[selectedItem.key]}
              onStateChange={handleStateChange}
              criteriaData={criteriaData}
              side={side}
              region={region}
              site={site}
            />
          </div>
        )}
      </div>
    </div>
  );
}
