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
import { Checkbox } from "@/components/ui/checkbox";
import {
  type CriterionResult,
  type DiagnosisDefinition,
  type Region,
  type Side,
  evaluateDiagnosis,
  getCriterionLabel,
  getCriterionSources,
  getLocationResult,
  isCompositeResult,
} from "@cmdetect/dc-tmd";
import { AlertTriangle, CircleMinus, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  sources?: string[];
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Extract checklist items from a criterion result tree.
 *
 * - AND composite at top level → each labeled child becomes a separate item
 * - Otherwise → single item with the criterion's own label
 */
function extractChecklistItems(result: CriterionResult, fallbackLabel: string): ChecklistItem[] {
  if (isCompositeResult(result) && result.criterion.type === "and") {
    return result.children.map((child) => ({
      label: getCriterionLabel(child.criterion) ?? fallbackLabel,
      sources: getCriterionSources(child.criterion),
    }));
  }

  return [{
    label: getCriterionLabel(result.criterion) ?? fallbackLabel,
    sources: getCriterionSources(result.criterion),
  }];
}

// ── Component ──────────────────────────────────────────────────────

function ChecklistRow({
  item,
  checked,
  onToggle,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-muted/50 cursor-pointer"
      onClick={onToggle}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-0.5 shrink-0"
        onClick={(e) => e.stopPropagation()}
      />
      <span className="text-sm flex-1">{item.label}</span>
      {item.sources?.map((s) => (
        <Badge key={s} variant="outline" className="text-xs px-1.5 py-0 font-mono shrink-0">
          {s}
        </Badge>
      ))}
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
    return extractChecklistItems(locationResult.sidedAnamnesisResult, "Seitenspezifische Anamnese");
  }, [locationResult]);

  const examinationItems = useMemo(() => {
    if (!locationResult) return [];
    return extractChecklistItems(locationResult.examinationResult, "Untersuchungsbefund");
  }, [locationResult]);

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCheckedItems(new Set());
  }, [diagnosis.id, side, region]);

  function toggleItem(key: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const isConfirmed = practitionerDecision === "confirmed";
  const hasRequiresConstraint = !!diagnosis.requires;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${isConfirmed ? "bg-green-50" : "bg-gray-50"}`}
      >
        <div>
          <h3 className="text-sm font-semibold">{diagnosis.nameDE}</h3>
        </div>
        {isConfirmed && (
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 font-medium text-green-700 border-green-300 bg-green-100"
          >
            Bestätigt
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="divide-y">
        {/* Anamnesis section */}
        <div>
          <SectionHeader label="Anamnese" />
          {anamnesisItems.map((item, i) => (
            <ChecklistRow
              key={i}
              item={item}
              checked={checkedItems.has(`anamnesis-${i}`)}
              onToggle={() => toggleItem(`anamnesis-${i}`)}
            />
          ))}
        </div>

        {/* Sided anamnesis section (optional) */}
        {sidedAnamnesisItems && (
          <div>
            <SectionHeader label="Seitenspezifische Anamnese" />
            {sidedAnamnesisItems.map((item, i) => (
              <ChecklistRow
                key={i}
                item={item}
                checked={checkedItems.has(`sidedAnamnesis-${i}`)}
                onToggle={() => toggleItem(`sidedAnamnesis-${i}`)}
              />
            ))}
          </div>
        )}

        {/* Examination section */}
        <div>
          <SectionHeader label="Untersuchung" />
          {examinationItems.map((item, i) => (
            <ChecklistRow
              key={i}
              item={item}
              checked={checkedItems.has(`examination-${i}`)}
              onToggle={() => toggleItem(`examination-${i}`)}
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
                className={requirementMet === false ? "text-amber-900" : "text-muted-foreground"}
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
  );
}
