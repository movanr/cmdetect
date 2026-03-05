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
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { PractitionerDecision } from "../types";
import { getDisplayRows } from "../utils/criterion-data-display";

type CriterionUserState = "positive" | "negative" | "pending";

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
  practitionerDecision?: PractitionerDecision;
  onConfirm?: (diagnosisId: string, note: string | null) => void;
  readOnly?: boolean;
  /** Whether cross-diagnosis requirement is met (for headache) */
  requirementMet?: boolean;
}

interface ChecklistItem {
  key: string;
  label: string;
  detail?: string;
  sources?: string[];
  result: CriterionResult;
}

// ── Helpers ─────────────────────────────────────────────────────────

function extractChecklistItems(
  result: CriterionResult,
  fallbackLabel: string,
  prefix: string
): ChecklistItem[] {
  if (isCompositeResult(result) && result.criterion.type === "and") {
    return result.children.map((child, i) => ({
      key: `${prefix}-${i}`,
      label: getCriterionLabel(child.criterion) ?? fallbackLabel,
      sources: getCriterionSources(child.criterion),
      result: child,
    }));
  }
  return [
    {
      key: prefix,
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
}: {
  sources: string[];
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
}) {
  const rows = useMemo(
    () => getDisplayRows(sources, criteriaData, side, region),
    [sources, criteriaData, side, region]
  );

  if (rows.length === 0)
    return <p className="text-xs text-muted-foreground">Keine Daten verfügbar.</p>;

  return (
    <div className="space-y-0.5">
      {rows.map((row, i) => (
        <div key={i} className="flex items-baseline gap-1.5 text-xs">
          {row.badge && (
            <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
              {row.badge}
            </Badge>
          )}
          <span className="text-muted-foreground">{row.label}:</span>
          <span className="font-medium whitespace-nowrap">{row.value}</span>
        </div>
      ))}
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
}: {
  item: ChecklistItem;
  userState: CriterionUserState | undefined;
  onStateChange: (key: string, state: CriterionUserState) => void;
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
}) {
  const { result } = item;
  return (
    <div className="p-4 space-y-4 text-sm">
      <h4 className="font-semibold">{item.label}</h4>

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
  practitionerDecision,
  onConfirm,
  readOnly,
  requirementMet,
}: CriteriaChecklistProps) {
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [userStates, setUserStates] = useState<Record<string, CriterionUserState>>({});

  const evalResult = useMemo(
    () => evaluateDiagnosis(diagnosis, criteriaData),
    [diagnosis, criteriaData]
  );

  const locationResult = useMemo(
    () => getLocationResult(evalResult, side, region),
    [evalResult, side, region]
  );

  // Extract checklist items
  const anamnesisItems = useMemo(
    () => extractChecklistItems(evalResult.anamnesisResult, "Anamnese", "anamnesis"),
    [evalResult.anamnesisResult]
  );

  // Pre-select first item; reset states when diagnosis/side/region changes
  useEffect(() => {
    setSelectedItem(anamnesisItems[0] ?? null);
    setUserStates({});
  }, [diagnosis.id, side, region]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidedAnamnesisItems = useMemo(() => {
    if (!locationResult?.sidedAnamnesisResult) return null;
    return extractChecklistItems(
      locationResult.sidedAnamnesisResult,
      "Seitenspezifische Anamnese",
      "sided-anamnesis"
    );
  }, [locationResult]);

  const examinationItems = useMemo(() => {
    if (!locationResult) return [];
    return extractChecklistItems(
      locationResult.examinationResult,
      "Untersuchungsbefund",
      "examination"
    );
  }, [locationResult]);

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

  const isConfirmed = practitionerDecision === "confirmed";
  const hasRequiresConstraint = !!diagnosis.requires;

  function handleStateChange(key: string, state: CriterionUserState) {
    setUserStates((prev) => {
      if (prev[key] === state) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: state };
    });
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
            {/* Anamnesis section */}
            <div>
              <SectionHeader label="Anamnese" />
              {anamnesisItems.map((item) => (
                <ChecklistRow
                  key={item.key}
                  item={item}
                  isSelected={selectedItem?.key === item.key}
                  userState={userStates[item.key]}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>

            {/* Sided anamnesis section (optional) */}
            {sidedAnamnesisItemsWithDetail && (
              <div>
                <SectionHeader label="Seitenspezifische Anamnese" />
                {sidedAnamnesisItemsWithDetail.map((item) => (
                  <ChecklistRow
                    key={item.key}
                    item={item}
                    isSelected={selectedItem?.key === item.key}
                    userState={userStates[item.key]}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}

            {/* Examination section */}
            <div>
              <SectionHeader label="Untersuchung" />
              {examinationItemsWithDetail.map((item) => (
                <ChecklistRow
                  key={item.key}
                  item={item}
                  isSelected={selectedItem?.key === item.key}
                  userState={userStates[item.key]}
                  onClick={() => setSelectedItem(item)}
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
