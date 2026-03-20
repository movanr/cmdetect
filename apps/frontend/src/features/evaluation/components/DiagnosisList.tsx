/**
 * DiagnosisList — Container for the unified diagnosis list.
 *
 * Manages accordion expand state (one diagnosis at a time),
 * documented diagnosis maps, myalgia mutual exclusion,
 * and requirement checks based on documented diagnoses.
 */

import {
  PALPATION_SITES,
  REGIONS,
  type DiagnosisDefinition,
  type DiagnosisId,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { useMemo, useState } from "react";
import type { CriteriaAssessment, CriterionUserState, DocumentedDiagnosis } from "../types";
import type { ChecklistItem } from "../utils/extract-criteria-items";
import { DiagnosisListItem } from "./DiagnosisListItem";

const MYALGIA_IDS: readonly DiagnosisId[] = [
  "myalgia",
  "localMyalgia",
  "myofascialPainWithSpreading",
  "myofascialPainWithReferral",
];

function locationKey(side: Side, site: PalpationSite | null, region: Region): string {
  return `${side}:${site ?? region}`;
}

interface DiagnosisListProps {
  applicableDiagnoses: DiagnosisDefinition[];
  side: Side;
  region: Region;
  site: PalpationSite | null;
  criteriaData: Record<string, unknown>;
  documentedDiagnoses: DocumentedDiagnosis[];
  assessmentMap: Map<string, CriteriaAssessment>;
  onDocument: (params: {
    diagnosisId: DiagnosisId;
    side: Side;
    region: Region;
    site: PalpationSite | null;
  }) => void;
  onUndocument: (rowId: string) => void;
  onAssessmentChange: (item: ChecklistItem, state: CriterionUserState) => void;
  onAssessmentClear: (item: ChecklistItem) => void;
  readOnly?: boolean;
}

export function DiagnosisList({
  applicableDiagnoses,
  side,
  region,
  site,
  criteriaData,
  documentedDiagnoses,
  assessmentMap,
  onDocument,
  onUndocument,
  onAssessmentChange,
  onAssessmentClear,
  readOnly,
}: DiagnosisListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // ── Derived state ──────────────────────────────────────────────

  const documentedMap = useMemo(() => {
    const map = new Map<string, string>(); // "diagnosisId:locationKey" → row id
    for (const d of documentedDiagnoses) {
      const key = `${d.diagnosisId}:${locationKey(d.side, d.site, d.region)}`;
      map.set(key, d.id);
    }
    return map;
  }, [documentedDiagnoses]);

  const documentedMyalgiaMap = useMemo(() => {
    const map = new Map<string, { diagnosisId: DiagnosisId; rowId: string }>();
    for (const d of documentedDiagnoses) {
      if ((MYALGIA_IDS as readonly string[]).includes(d.diagnosisId)) {
        const locKey = locationKey(d.side, d.site, d.region);
        map.set(locKey, { diagnosisId: d.diagnosisId, rowId: d.id });
      }
    }
    return map;
  }, [documentedDiagnoses]);

  /** Requirement check based on documented diagnoses (not auto-evaluation). */
  const requirementMetMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const d of applicableDiagnoses) {
      if (!d.requires) continue;
      map[d.id] = d.requires.anyOf.some((reqId) =>
        documentedDiagnoses.some((doc) => doc.diagnosisId === reqId),
      );
    }
    return map;
  }, [applicableDiagnoses, documentedDiagnoses]);

  // ── Location helpers ──────────────────────────────────────────

  const currentLocKey = locationKey(side, site, region);
  const sideLabel = side === "right" ? "rechte Seite" : "linke Seite";
  const localisationLabel = `${site ? PALPATION_SITES[site] : REGIONS[region]}, ${sideLabel}`;

  // ── Toggle handlers ───────────────────────────────────────────

  function handleToggle(diagnosisId: string) {
    if (readOnly) return;
    const key = `${diagnosisId}:${currentLocKey}`;
    const existingRowId = documentedMap.get(key);

    if (existingRowId) {
      onUndocument(existingRowId);
    } else {
      onDocument({
        diagnosisId: diagnosisId as DiagnosisId,
        side,
        region,
        site,
      });
    }
  }

  function handleMyalgiaSelect(diagnosisId: string) {
    if (readOnly) return;
    const existing = documentedMyalgiaMap.get(currentLocKey);

    if (existing) {
      onUndocument(existing.rowId);
      if (existing.diagnosisId !== diagnosisId) {
        onDocument({
          diagnosisId: diagnosisId as DiagnosisId,
          side,
          region,
          site,
        });
      }
    } else {
      onDocument({
        diagnosisId: diagnosisId as DiagnosisId,
        side,
        region,
        site,
      });
    }
  }

  // ── Split diagnoses ───────────────────────────────────────────

  const myalgiaDiagnoses = applicableDiagnoses.filter((d) =>
    (MYALGIA_IDS as readonly string[]).includes(d.id),
  );
  const otherDiagnoses = applicableDiagnoses.filter(
    (d) => !(MYALGIA_IDS as readonly string[]).includes(d.id),
  );

  const selectedMyalgia = documentedMyalgiaMap.get(currentLocKey)?.diagnosisId ?? "";

  function toggleExpand(diagnosisId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(diagnosisId)) {
        next.delete(diagnosisId);
      } else {
        next.add(diagnosisId);
      }
      return next;
    });
  }

  if (applicableDiagnoses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Diagnosen für die gewählte Region verfügbar.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {/* Myalgia group — radio-like mutual exclusion */}
      {myalgiaDiagnoses.map((d) => (
        <DiagnosisListItem
          key={d.id}
          diagnosis={d}
          side={side}
          region={region}
          site={site}
          localisationLabel={localisationLabel}
          isDocumented={selectedMyalgia === d.id}
          criteriaData={criteriaData}
          assessmentMap={assessmentMap}
          onToggleDocument={() => handleMyalgiaSelect(d.id)}
          onAssessmentChange={onAssessmentChange}
          onAssessmentClear={onAssessmentClear}
          readOnly={readOnly}
          requirementMet={requirementMetMap[d.id]}
          isExpanded={expandedIds.has(d.id)}
          onToggleExpand={() => toggleExpand(d.id)}
        />
      ))}

      {/* Other diagnoses — checkboxes */}
      {otherDiagnoses.map((d) => (
        <DiagnosisListItem
          key={d.id}
          diagnosis={d}
          side={side}
          region={region}
          site={site}
          localisationLabel={localisationLabel}
          isDocumented={documentedMap.has(`${d.id}:${currentLocKey}`)}
          criteriaData={criteriaData}
          assessmentMap={assessmentMap}
          onToggleDocument={() => handleToggle(d.id)}
          onAssessmentChange={onAssessmentChange}
          onAssessmentClear={onAssessmentClear}
          readOnly={readOnly}
          requirementMet={requirementMetMap[d.id]}
          isExpanded={expandedIds.has(d.id)}
          onToggleExpand={() => toggleExpand(d.id)}
        />
      ))}
    </div>
  );
}
