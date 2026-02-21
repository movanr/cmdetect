/**
 * Hook for fetching persisted diagnosis results for a patient record.
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_DIAGNOSIS_RESULTS } from "../queries";
import type { PersistedDiagnosisResult, PractitionerDecision } from "../types";
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

export const DIAGNOSIS_RESULTS_QUERY_KEY = "diagnosis-results";

export function useDiagnosisResults(patientRecordId: string) {
  return useQuery({
    queryKey: [DIAGNOSIS_RESULTS_QUERY_KEY, patientRecordId],
    queryFn: async (): Promise<PersistedDiagnosisResult[]> => {
      const result = await execute(GET_DIAGNOSIS_RESULTS, {
        patient_record_id: patientRecordId,
      });

      return (result.diagnosis_result ?? []).map(mapResult);
    },
    enabled: !!patientRecordId,
  });
}
