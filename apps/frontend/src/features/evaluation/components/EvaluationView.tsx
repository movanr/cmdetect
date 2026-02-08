/**
 * EvaluationView — Main evaluation page component.
 *
 * Evaluates all DC/TMD diagnoses against SQ + examination data
 * and displays results grouped into Pain Disorders and Joint Disorders.
 * Each diagnosis gets its own head diagram and region table.
 *
 * Myalgia subtypes are flattened: if a subtype is positive it replaces
 * the parent myalgia diagnosis to avoid confusion.
 */

import { useMemo } from "react";
import {
  ALL_DIAGNOSES,
  DIAGNOSIS_PARENT,
  JOINT_DISORDER_IDS,
  PAIN_DISORDER_IDS,
  evaluateAllDiagnoses,
  type DiagnosisEvaluationResult,
  type DiagnosisId,
} from "@cmdetect/dc-tmd";
import type { FormValues } from "../../examination";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { DecisionTreePlaceholder } from "./DecisionTreePlaceholder";
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
          DIAGNOSIS_PARENT[r.diagnosisId as keyof typeof DIAGNOSIS_PARENT] ===
          result.diagnosisId
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

export function EvaluationView({ sqAnswers, examinationData }: EvaluationViewProps) {
  const results = useMemo(() => {
    const data = mapToCriteriaData(sqAnswers, examinationData);
    return evaluateAllDiagnoses(ALL_DIAGNOSES, data);
  }, [sqAnswers, examinationData]);

  const painResults = useMemo(
    () =>
      flattenResults(
        results.filter((r) =>
          PAIN_DISORDER_IDS.includes(r.diagnosisId as DiagnosisId)
        )
      ),
    [results]
  );

  const jointResults = useMemo(
    () =>
      flattenResults(
        results.filter((r) =>
          JOINT_DISORDER_IDS.includes(r.diagnosisId as DiagnosisId)
        )
      ),
    [results]
  );

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Left: Diagnosis blocks */}
      <div className="space-y-8 xl:flex-1 min-w-0">
        {/* Pain Disorders */}
        {painResults.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Schmerzstörungen</h2>
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

      {/* Right: Decision tree (placeholder for now) */}
      <div className="xl:flex-1 min-w-0">
        <section>
          <h2 className="text-lg font-semibold mb-4">Entscheidungsbaum</h2>
          <DecisionTreePlaceholder />
        </section>
      </div>
    </div>
  );
}
