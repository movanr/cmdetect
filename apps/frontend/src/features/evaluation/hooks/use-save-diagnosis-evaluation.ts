/**
 * Mutation hooks for documenting/undocumenting diagnoses.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { DOCUMENT_DIAGNOSIS, UNDOCUMENT_DIAGNOSIS } from "../queries";
import { DOCUMENTED_DIAGNOSES_QUERY_KEY } from "./use-diagnosis-evaluation";
import type { DocumentedDiagnosis } from "../types";
import type { DiagnosisId, PalpationSite, Region, Side } from "@cmdetect/dc-tmd";

interface DocumentParams {
  patientRecordId: string;
  diagnosisId: DiagnosisId;
  side: Side;
  region: Region;
  site: PalpationSite | null;
  userId: string;
}

/**
 * Insert a documented diagnosis row with optimistic cache update.
 */
export function useDocumentDiagnosis(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = [DOCUMENTED_DIAGNOSES_QUERY_KEY, patientRecordId];

  return useMutation({
    mutationFn: async (params: DocumentParams) => {
      return execute(DOCUMENT_DIAGNOSIS, {
        object: {
          patient_record_id: params.patientRecordId,
          diagnosis_id: params.diagnosisId,
          side: params.side,
          region: params.region,
          site: params.site,
          documented_by: params.userId,
          documented_at: new Date().toISOString(),
        },
      });
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DocumentedDiagnosis[]>(queryKey);

      const optimistic: DocumentedDiagnosis = {
        id: `optimistic-${Date.now()}`,
        diagnosisId: params.diagnosisId,
        side: params.side,
        region: params.region,
        site: params.site,
        documentedBy: params.userId,
        documentedAt: new Date().toISOString(),
        note: null,
      };

      queryClient.setQueryData<DocumentedDiagnosis[]>(queryKey, [
        ...(previous ?? []),
        optimistic,
      ]);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Delete a documented diagnosis row by PK with optimistic cache update.
 */
export function useUndocumentDiagnosis(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = [DOCUMENTED_DIAGNOSES_QUERY_KEY, patientRecordId];

  return useMutation({
    mutationFn: async (id: string) => {
      return execute(UNDOCUMENT_DIAGNOSIS, { id });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<DocumentedDiagnosis[]>(queryKey);

      queryClient.setQueryData<DocumentedDiagnosis[]>(
        queryKey,
        (previous ?? []).filter((d) => d.id !== id)
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
