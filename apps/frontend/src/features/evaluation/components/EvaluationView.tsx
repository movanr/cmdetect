/**
 * EvaluationView — Main evaluation page component.
 *
 * Evaluates all DC/TMD diagnoses against SQ + examination data
 * and displays the results as diagnosis cards with a decision tree placeholder.
 */

import { useMemo } from "react";
import {
  ALL_DIAGNOSES,
  DIAGNOSIS_PARENT,
  evaluateAllDiagnoses,
} from "@cmdetect/dc-tmd";
import type { FormValues } from "../../examination";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { DiagnosisCard } from "./DiagnosisCard";
import { DecisionTreePlaceholder } from "./DecisionTreePlaceholder";

interface EvaluationViewProps {
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
}

export function EvaluationView({ sqAnswers, examinationData }: EvaluationViewProps) {
  const results = useMemo(() => {
    const data = mapToCriteriaData(sqAnswers, examinationData);
    return evaluateAllDiagnoses(ALL_DIAGNOSES, data);
  }, [sqAnswers, examinationData]);

  // Group: parent diagnoses first, subtypes indented below
  const parentResults = results.filter(
    (r) => !DIAGNOSIS_PARENT[r.diagnosisId as keyof typeof DIAGNOSIS_PARENT]
  );
  const subtypeResults = results.filter(
    (r) => !!DIAGNOSIS_PARENT[r.diagnosisId as keyof typeof DIAGNOSIS_PARENT]
  );

  return (
    <div className="space-y-8">
      {/* Diagnosis Results */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Diagnoseergebnisse</h2>
        <div className="space-y-4">
          {parentResults.map((result) => (
            <div key={result.diagnosisId}>
              <DiagnosisCard result={result} />
              {/* Render subtypes below parent */}
              {subtypeResults
                .filter(
                  (sub) =>
                    DIAGNOSIS_PARENT[sub.diagnosisId as keyof typeof DIAGNOSIS_PARENT] ===
                    result.diagnosisId
                )
                .map((sub) => (
                  <div key={sub.diagnosisId} className="mt-3">
                    <DiagnosisCard result={sub} />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      {/* Decision Tree Placeholder */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Entscheidungsbaum</h2>
        <DecisionTreePlaceholder />
      </section>
    </div>
  );
}
