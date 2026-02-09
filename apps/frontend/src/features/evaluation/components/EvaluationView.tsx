/**
 * EvaluationView — Main evaluation page component.
 *
 * Evaluates all DC/TMD diagnoses against SQ + examination data
 * and displays results grouped into Pain Disorders and Joint Disorders.
 * Each diagnosis gets its own head diagram and region table.
 *
 * Myalgia subtypes are flattened: if a subtype is positive it replaces
 * the parent myalgia diagnosis to avoid confusion.
 *
 * The right column shows an interactive decision tree corresponding
 * to the selected diagnosis, side, and region.
 */

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ALL_DIAGNOSES,
  DIAGNOSIS_PARENT,
  JOINT_DISORDER_IDS,
  PAIN_DISORDER_IDS,
  evaluateAllDiagnoses,
  type DiagnosisEvaluationResult,
  type DiagnosisId,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { useMemo, useState } from "react";
import {
  DecisionTreeView,
  createMyalgiaSubtypesTree,
  createMyalgiaTree,
} from "../../decision-tree";
import type { FormValues } from "../../examination";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { DiagnosisBlock } from "./DiagnosisBlock";

interface EvaluationViewProps {
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
}

/**
 * Flatten parent/subtype hierarchy:
 * - If any subtype of a parent is positive, show only the positive subtypes
 * - Otherwise show the parent
 * - Diagnoses without subtypes pass through unchanged
 */
function flattenResults(results: DiagnosisEvaluationResult[]): DiagnosisEvaluationResult[] {
  const flat: DiagnosisEvaluationResult[] = [];

  // Collect parent IDs that have subtypes in this result set
  const parentIds = new Set(
    results
      .map((r) => DIAGNOSIS_PARENT[r.diagnosisId as keyof typeof DIAGNOSIS_PARENT])
      .filter(Boolean) as DiagnosisId[]
  );

  for (const result of results) {
    const isSubtype = !!DIAGNOSIS_PARENT[result.diagnosisId as keyof typeof DIAGNOSIS_PARENT];
    if (isSubtype) continue; // Handle subtypes through their parent

    if (parentIds.has(result.diagnosisId as DiagnosisId)) {
      // This parent has subtypes — check for positive ones
      const subtypes = results.filter(
        (r) =>
          DIAGNOSIS_PARENT[r.diagnosisId as keyof typeof DIAGNOSIS_PARENT] === result.diagnosisId
      );
      const positiveSubtypes = subtypes.filter((r) => r.status === "positive");

      if (positiveSubtypes.length > 0) {
        flat.push(...positiveSubtypes);
      } else {
        flat.push(result);
      }
    } else {
      flat.push(result);
    }
  }

  return flat;
}

/** Myalgia-related diagnosis IDs for tree selection */
const MYALGIA_SUBTYPE_IDS: DiagnosisId[] = [
  "localMyalgia",
  "myofascialPainWithSpreading",
  "myofascialPainWithReferral",
];

export function EvaluationView({ sqAnswers, examinationData }: EvaluationViewProps) {
  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData]
  );

  const results = useMemo(() => evaluateAllDiagnoses(ALL_DIAGNOSES, criteriaData), [criteriaData]);

  const painResults = useMemo(
    () =>
      flattenResults(
        results.filter((r) => PAIN_DISORDER_IDS.includes(r.diagnosisId as DiagnosisId))
      ),
    [results]
  );

  const jointResults = useMemo(
    () =>
      flattenResults(
        results.filter((r) => JOINT_DISORDER_IDS.includes(r.diagnosisId as DiagnosisId))
      ),
    [results]
  );

  const [selectedSide, setSelectedSide] = useState<Side>("right");
  const [selectedRegion, setSelectedRegion] = useState<Region>("temporalis");

  // Determine which tree type to show
  const treeType = useMemo(() => {
    if (painResults.length === 0) return null;
    const firstResult = painResults[0];
    const isSubtype = MYALGIA_SUBTYPE_IDS.includes(firstResult.diagnosisId as DiagnosisId);
    const isMyalgia = firstResult.diagnosisId === "myalgia" || isSubtype;
    if (!isMyalgia) return null;
    return isSubtype ? "subtypes" : "myalgia";
  }, [painResults]);

  const treeData = useMemo(() => {
    if (!treeType) return null;
    return treeType === "subtypes"
      ? createMyalgiaSubtypesTree(selectedSide, selectedRegion)
      : createMyalgiaTree(selectedSide, selectedRegion);
  }, [treeType, selectedSide, selectedRegion]);

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Left: Diagnosis blocks */}
      <div className="space-y-8 xl:flex-1 min-w-0">
        {/* Pain Disorders */}
        {painResults.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Schmerzerkrankungen</h2>
            <div className="space-y-8">
              {painResults.map((result) => (
                <DiagnosisBlock key={result.diagnosisId} result={result} />
              ))}
            </div>
          </section>
        )}

        {/* Joint Disorders — hidden when empty */}
        {jointResults.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Gelenkstörungen</h2>
            <div className="space-y-8">
              {jointResults.map((result) => (
                <DiagnosisBlock key={result.diagnosisId} result={result} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right: Decision tree */}
      <div className="xl:flex-1 min-w-0">
        <section>
          <h2 className="text-lg font-semibold mb-4">Entscheidungsbaum</h2>
          {treeData ? (
            <div className="space-y-4">
              {/* Side & Region toggles */}
              <div className="flex flex-wrap gap-3">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={selectedSide}
                  onValueChange={(v) => {
                    if (v) setSelectedSide(v as Side);
                  }}
                >
                  <ToggleGroupItem value="right">Rechts</ToggleGroupItem>
                  <ToggleGroupItem value="left">Links</ToggleGroupItem>
                </ToggleGroup>

                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={selectedRegion}
                  onValueChange={(v) => {
                    if (v) setSelectedRegion(v as Region);
                  }}
                >
                  <ToggleGroupItem value="temporalis">Temporalis</ToggleGroupItem>
                  <ToggleGroupItem value="masseter">Masseter</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <DecisionTreeView tree={treeData} data={criteriaData} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Kein Entscheidungsbaum für die aktuelle Diagnose verfügbar.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
