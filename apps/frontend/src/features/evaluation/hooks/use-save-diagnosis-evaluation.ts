/**
 * Mutation hooks for saving/updating diagnosis evaluations.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import {
  DELETE_DIAGNOSIS_EVALUATION,
  INSERT_DIAGNOSIS_EVALUATION,
  UPDATE_DIAGNOSIS_RESULT_DECISION,
} from "../queries";
import { DIAGNOSIS_EVALUATION_QUERY_KEY } from "./use-diagnosis-evaluation";
import type { PractitionerDecision, PersistedDiagnosisEvaluation } from "../types";
import type { CriterionStatus, DiagnosisId, Region, Side } from "@cmdetect/dc-tmd";

interface DiagnosisResultInput {
  patient_record_id: string;
  diagnosis_id: DiagnosisId;
  side: Side;
  region: Region;
  computed_status: CriterionStatus;
}

interface SaveEvaluationParams {
  oldEvaluationId?: string;
  patientRecordId: string;
  sourceDataHash: string;
  results: DiagnosisResultInput[];
}

/**
 * Saves a new diagnosis evaluation, deleting any existing one first.
 * This resets all practitioner decisions when source data changes.
 */
export function useSaveDiagnosisEvaluation(patientRecordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      oldEvaluationId,
      patientRecordId: prId,
      sourceDataHash,
      results,
    }: SaveEvaluationParams) => {
      // Delete existing evaluation (cascade deletes results)
      if (oldEvaluationId) {
        await execute(DELETE_DIAGNOSIS_EVALUATION, { id: oldEvaluationId });
      }

      // Insert new evaluation with nested results
      return execute(INSERT_DIAGNOSIS_EVALUATION, {
        patient_record_id: prId,
        source_data_hash: sourceDataHash,
        results,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DIAGNOSIS_EVALUATION_QUERY_KEY, patientRecordId],
      });
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
  const queryKey = [DIAGNOSIS_EVALUATION_QUERY_KEY, patientRecordId];

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
      const previous =
        queryClient.getQueryData<PersistedDiagnosisEvaluation | null>(queryKey);

      if (previous) {
        queryClient.setQueryData<PersistedDiagnosisEvaluation>(queryKey, {
          ...previous,
          results: previous.results.map((r) =>
            r.id === resultId
              ? {
                  ...r,
                  practitionerDecision,
                  decidedBy: practitionerDecision ? userId : null,
                  decidedAt: practitionerDecision
                    ? new Date().toISOString()
                    : null,
                  note,
                }
              : r
          ),
        });
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
