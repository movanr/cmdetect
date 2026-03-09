/**
 * Hook for fetching documented diagnoses for a patient record.
 */

import { useQuery } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { GET_DOCUMENTED_DIAGNOSES } from "../queries";
import type { DocumentedDiagnosis } from "../types";
import type { DiagnosisId, PalpationSite, Region, Side } from "@cmdetect/dc-tmd";

function mapRow(row: {
  id: string;
  diagnosis_id: string;
  side: string;
  region: string;
  site?: string | null;
  documented_by?: string | null;
  documented_at?: string | null;
  note?: string | null;
}): DocumentedDiagnosis {
  return {
    id: row.id,
    diagnosisId: row.diagnosis_id as DiagnosisId,
    side: row.side as Side,
    region: row.region as Region,
    site: (row.site as PalpationSite) ?? null,
    documentedBy: row.documented_by ?? null,
    documentedAt: row.documented_at ?? null,
    note: row.note ?? null,
  };
}

export const DOCUMENTED_DIAGNOSES_QUERY_KEY = "documented-diagnoses";

export function useDocumentedDiagnoses(patientRecordId: string) {
  return useQuery({
    queryKey: [DOCUMENTED_DIAGNOSES_QUERY_KEY, patientRecordId],
    queryFn: async (): Promise<DocumentedDiagnosis[]> => {
      const result = await execute(GET_DOCUMENTED_DIAGNOSES, {
        patient_record_id: patientRecordId,
      });

      return (result.documented_diagnosis ?? []).map(mapRow);
    },
    enabled: !!patientRecordId,
  });
}
