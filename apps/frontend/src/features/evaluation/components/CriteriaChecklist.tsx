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
import {
  type CriterionResult,
  type CriterionStatus,
  type DiagnosisDefinition,
  type Region,
  type Side,
  REGIONS,
  SIDES,
  evaluateDiagnosis,
  getCriterionLabel,
  getLocationResult,
  isCompositeResult,
} from "@cmdetect/dc-tmd";
import {
  AlertTriangle,
  Circle,
  CircleCheck,
  CircleMinus,
  CircleX,
  Info,
} from "lucide-react";
import { useMemo } from "react";
import type { PractitionerDecision } from "../types";

interface CriteriaChecklistProps {
  diagnosis: DiagnosisDefinition;
  criteriaData: Record<string, unknown>;
  side: Side;
  region: Region;
  practitionerDecision?: PractitionerDecision;
  onConfirm?: (diagnosisId: string, note: string | null) => void;
  readOnly?: boolean;
  /** Whether cross-diagnosis requirement is met (for headache) */
  requirementMet?: boolean;
}

interface ChecklistItem {
  label: string;
  status: CriterionStatus;
}

// ── Status styling ─────────────────────────────────────────────────

const statusConfig: Record<
  CriterionStatus,
  { icon: typeof CircleCheck; iconClass: string; badgeClass: string; badgeLabel: string }
> = {
  positive: {
    icon: CircleCheck,
    iconClass: "text-blue-600",
    badgeClass: "text-blue-700 border-blue-200 bg-blue-50",
    badgeLabel: "Ja",
  },
  negative: {
    icon: CircleX,
    iconClass: "text-gray-400",
    badgeClass: "text-gray-500 border-gray-200 bg-gray-100",
    badgeLabel: "Nein",
  },
  pending: {
    icon: Circle,
    iconClass: "text-yellow-500",
    badgeClass: "text-yellow-700 border-yellow-200 bg-yellow-50",
    badgeLabel: "Offen",
  },
};

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Extract checklist items from a criterion result tree.
 *
 * - AND composite at top level → each labeled child becomes a separate item
 * - Otherwise → single item with the criterion's own label
 */
function extractChecklistItems(
  result: CriterionResult,
  fallbackLabel: string
): ChecklistItem[] {
  if (
    isCompositeResult(result) &&
    result.criterion.type === "and"
  ) {
    return result.children.map((child) => ({
      label: getCriterionLabel(child.criterion) ?? fallbackLabel,
      status: child.status,
    }));
  }

  return [
    {
      label: getCriterionLabel(result.criterion) ?? fallbackLabel,
      status: result.status,
    },
  ];
}

// ── Component ──────────────────────────────────────────────────────

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-md hover:bg-muted/50">
      <div className="flex items-start gap-2 min-w-0">
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.iconClass}`} />
        <span className="text-sm">{item.label}</span>
      </div>
      <Badge
        variant="outline"
        className={`text-[10px] px-1.5 py-0 h-5 font-medium shrink-0 ${config.badgeClass}`}
      >
        {config.badgeLabel}
      </Badge>
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

export function CriteriaChecklist({
  diagnosis,
  criteriaData,
  side,
  region,
  practitionerDecision,
  onConfirm,
  readOnly,
  requirementMet,
}: CriteriaChecklistProps) {
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
    () => extractChecklistItems(evalResult.anamnesisResult, "Anamnese"),
    [evalResult.anamnesisResult]
  );

  const sidedAnamnesisItems = useMemo(() => {
    if (!locationResult?.sidedAnamnesisResult) return null;
    return extractChecklistItems(
      locationResult.sidedAnamnesisResult,
      "Seitenspezifische Anamnese"
    );
  }, [locationResult?.sidedAnamnesisResult]);

  const examinationItems = useMemo(() => {
    if (!locationResult) return [];
    return extractChecklistItems(
      locationResult.examinationResult,
      "Untersuchungsbefund"
    );
  }, [locationResult]);

  // Overall status for the header badge
  const overallStatus: CriterionStatus = !locationResult
    ? "pending"
    : evalResult.anamnesisStatus === "negative" || locationResult.status === "negative"
      ? "negative"
      : evalResult.anamnesisStatus === "positive" && locationResult.status === "positive"
        ? "positive"
        : "pending";

  const isConfirmed = practitionerDecision === "confirmed";
  const regionLabel = REGIONS[region] ?? region;
  const sideLabel = SIDES[side] ?? side;
  const hasRequiresConstraint = !!diagnosis.requires;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isConfirmed
            ? "bg-green-50"
            : overallStatus === "positive"
              ? "bg-blue-50"
              : overallStatus === "pending"
                ? "bg-yellow-50"
                : "bg-gray-50"
        }`}
      >
        <div>
          <h3 className="text-sm font-semibold">{diagnosis.nameDE}</h3>
          <p className="text-xs text-muted-foreground">
            {regionLabel}, {sideLabel}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`text-xs px-2 py-0.5 font-medium ${
            isConfirmed
              ? "text-green-700 border-green-300 bg-green-100"
              : statusConfig[overallStatus].badgeClass
          }`}
        >
          {isConfirmed
            ? "Bestätigt"
            : overallStatus === "positive"
              ? "Kriterien erfüllt"
              : overallStatus === "negative"
                ? "Kriterien nicht erfüllt"
                : "Unvollständig"}
        </Badge>
      </div>

      {/* Body */}
      <div className="divide-y">
        {/* Anamnesis section */}
        <div>
          <SectionHeader label="Anamnese" />
          {anamnesisItems.map((item, i) => (
            <ChecklistRow key={i} item={item} />
          ))}
        </div>

        {/* Sided anamnesis section (optional) */}
        {sidedAnamnesisItems && (
          <div>
            <SectionHeader label="Seitenspezifische Anamnese" />
            {sidedAnamnesisItems.map((item, i) => (
              <ChecklistRow key={i} item={item} />
            ))}
          </div>
        )}

        {/* Examination section */}
        <div>
          <SectionHeader label={`Untersuchung (${regionLabel}, ${sideLabel})`} />
          {examinationItems.map((item, i) => (
            <ChecklistRow key={i} item={item} />
          ))}
        </div>

        {/* Cross-diagnosis requirement alert */}
        {hasRequiresConstraint && (
          <div className="px-3 py-3">
            <Alert
              className={
                requirementMet === false
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-muted/50"
              }
            >
              {requirementMet === false ? (
                <AlertTriangle className="text-amber-500" />
              ) : (
                <Info className="text-muted-foreground" />
              )}
              <AlertDescription
                className={
                  requirementMet === false
                    ? "text-amber-900"
                    : "text-muted-foreground"
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
                <>
                  <CircleCheck className="mr-2 h-4 w-4" />
                  Diagnose stellen
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
