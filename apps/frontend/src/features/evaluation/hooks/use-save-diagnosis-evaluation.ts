/**
 * Mutation hooks for saving/updating diagnosis evaluations.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { UPSERT_DIAGNOSIS_RESULTS, UPDATE_DIAGNOSIS_RESULT_DECISION } from "../queries";
import { DIAGNOSIS_RESULTS_QUERY_KEY } from "./use-diagnosis-evaluation";
import type { PractitionerDecision, PersistedDiagnosisResult } from "../types";
import type { CriterionStatus, DiagnosisId, Region, Side } from "@cmdetect/dc-tmd";

interface DiagnosisResultInput {
  patient_record_id: string;
  diagnosis_id: DiagnosisId;
  side: Side;
  region: Region;
  computed_status: CriterionStatus;
}

/**
 * Upserts diagnosis result rows — only updates computed_status on conflict,
 * preserving practitioner decisions.
 */
export function useUpsertDiagnosisResults(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = [DIAGNOSIS_RESULTS_QUERY_KEY, patientRecordId];

  return useMutation({
    mutationFn: async (results: DiagnosisResultInput[]) => {
      return execute(UPSERT_DIAGNOSIS_RESULTS, { results });
    },
    onSuccess: (data) => {
      // Populate cache immediately from the mutation's returning data.
      // This avoids a race window where isSyncing becomes false but results
      // is still [] (waiting for a background refetch after invalidation).
      const returning = data?.insert_diagnosis_result?.returning ?? [];
      if (returning.length > 0) {
        const mapped: PersistedDiagnosisResult[] = returning.map((row) => ({
          id: row.id,
          diagnosisId: row.diagnosis_id as DiagnosisId,
          side: row.side as Side,
          region: row.region as Region,
          computedStatus: row.computed_status as CriterionStatus,
          practitionerDecision: (row.practitioner_decision ?? null) as PractitionerDecision,
          decidedBy: row.decided_by ?? null,
          decidedAt: row.decided_at ?? null,
          note: row.note ?? null,
        }));
        queryClient.setQueryData<PersistedDiagnosisResult[]>(queryKey, mapped);
      } else {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

interface UpdateDecisionParams {
  resultId: string;
  practitionerDecision: PractitionerDecision;
  userId: string;
  note: string | null;
}

/**
 * Updates practitioner decision on a single diagnosis result row.
 * Uses optimistic update for instant UI feedback.
 */
export function useUpdateDiagnosisDecision(patientRecordId: string) {
  const queryClient = useQueryClient();
  const queryKey = [DIAGNOSIS_RESULTS_QUERY_KEY, patientRecordId];

  return useMutation({
    mutationFn: async ({
      resultId,
      practitionerDecision,
      userId,
      note,
    }: UpdateDecisionParams) => {
      return execute(UPDATE_DIAGNOSIS_RESULT_DECISION, {
        id: resultId,
        practitioner_decision: practitionerDecision,
        decided_by: practitionerDecision ? userId : null,
        decided_at: practitionerDecision ? new Date().toISOString() : null,
        note,
      });
    },
    onMutate: async ({ resultId, practitionerDecision, userId, note }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PersistedDiagnosisResult[]>(queryKey);

      if (previous) {
        queryClient.setQueryData<PersistedDiagnosisResult[]>(
          queryKey,
          previous.map((r) =>
            r.id === resultId
              ? {
                  ...r,
                  practitionerDecision,
                  decidedBy: practitionerDecision ? userId : null,
                  decidedAt: practitionerDecision ? new Date().toISOString() : null,
                  note,
                }
              : r
          )
        );
      }

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
