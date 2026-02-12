/**
 * Hook for fetching persisted diagnosis evaluation for a patient record.
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_DIAGNOSIS_EVALUATION } from "../queries";
import type {
  PersistedDiagnosisEvaluation,
  PersistedDiagnosisResult,
  PractitionerDecision,
} from "../types";
import type { CriterionStatus, DiagnosisId, Region, Side } from "@cmdetect/dc-tmd";

function mapResult(row: {
  id: string;
  diagnosis_id: string;
  side: string;
  region: string;
  computed_status: string;
  practitioner_decision?: string | null;
  decided_by?: string | null;
  decided_at?: string | null;
  note?: string | null;
}): PersistedDiagnosisResult {
  return {
    id: row.id,
    diagnosisId: row.diagnosis_id as DiagnosisId,
    side: row.side as Side,
    region: row.region as Region,
    computedStatus: row.computed_status as CriterionStatus,
    practitionerDecision: (row.practitioner_decision ?? null) as PractitionerDecision,
    decidedBy: row.decided_by ?? null,
    decidedAt: row.decided_at ?? null,
    note: row.note ?? null,
  };
}

export const DIAGNOSIS_EVALUATION_QUERY_KEY = "diagnosis-evaluation";

export function useDiagnosisEvaluation(patientRecordId: string) {
  return useQuery({
    queryKey: [DIAGNOSIS_EVALUATION_QUERY_KEY, patientRecordId],
    queryFn: async (): Promise<PersistedDiagnosisEvaluation | null> => {
      const result = await execute(GET_DIAGNOSIS_EVALUATION, {
        patient_record_id: patientRecordId,
      });

      const evaluation = result.diagnosis_evaluation?.[0];
      if (!evaluation) return null;

      return {
        id: evaluation.id,
        patientRecordId: evaluation.patient_record_id,
        sourceDataHash: evaluation.source_data_hash,
        evaluatedBy: evaluation.evaluated_by,
        evaluatedAt: evaluation.evaluated_at,
        results: evaluation.diagnosis_results.map(mapResult),
      };
    },
    enabled: !!patientRecordId,
  });
}
