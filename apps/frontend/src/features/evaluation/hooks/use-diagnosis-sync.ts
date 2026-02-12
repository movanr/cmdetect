/**
 * Diagnosis Sync Hook
 *
 * Orchestrates client-side diagnosis evaluation with backend persistence.
 * - Computes diagnoses client-side via evaluateAllDiagnoses
 * - Computes SHA-256 hash of source data
 * - Syncs results to backend (insert new or reuse existing if hash matches)
 * - Provides mutation for practitioner decisions
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ALL_DIAGNOSES,
  evaluateAllDiagnoses,
  type CriterionStatus,
  type DiagnosisEvaluationResult,
  type DiagnosisId,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import type { FormValues } from "../../examination";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { computeSourceDataHash } from "../utils/source-data-hash";
import { useDiagnosisEvaluation } from "./use-diagnosis-evaluation";
import {
  useSaveDiagnosisEvaluation,
  useUpdateDiagnosisDecision,
} from "./use-save-diagnosis-evaluation";
import type { PersistedDiagnosisEvaluation, PractitionerDecision } from "../types";

interface UseDiagnosisSyncParams {
  patientRecordId: string;
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
  userId: string;
  /** Skip sync until source data is fully loaded */
  enabled?: boolean;
}

interface UseDiagnosisSyncResult {
  /** Client-side computed diagnosis results */
  allResults: DiagnosisEvaluationResult[];
  /** Persisted evaluation from backend (null while loading/syncing) */
  evaluation: PersistedDiagnosisEvaluation | null;
  /** Whether sync is in progress (loading or saving) */
  isSyncing: boolean;
  /** Update a practitioner decision on a single result row */
  updateDecision: (params: {
    resultId: string;
    practitionerDecision: PractitionerDecision;
    note: string | null;
  }) => void;
  /** Whether a decision update is in-flight */
  isUpdatingDecision: boolean;
}

/**
 * Flatten evaluation results into per-(diagnosis, side, region) rows
 * for backend storage.
 */
function buildResultRows(
  allResults: DiagnosisEvaluationResult[],
  patientRecordId: string
): Array<{
  patient_record_id: string;
  diagnosis_id: DiagnosisId;
  side: Side;
  region: Region;
  computed_status: CriterionStatus;
}> {
  const rows: Array<{
    patient_record_id: string;
    diagnosis_id: DiagnosisId;
    side: Side;
    region: Region;
    computed_status: CriterionStatus;
  }> = [];

  for (const result of allResults) {
    for (const loc of result.locationResults) {
      rows.push({
        patient_record_id: patientRecordId,
        diagnosis_id: result.diagnosisId,
        side: loc.side,
        region: loc.region,
        computed_status: loc.status,
      });
    }
  }

  return rows;
}

export function useDiagnosisSync({
  patientRecordId,
  sqAnswers,
  examinationData,
  userId,
  enabled = true,
}: UseDiagnosisSyncParams): UseDiagnosisSyncResult {
  // Client-side evaluation
  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData]
  );

  const allResults = useMemo(
    () => evaluateAllDiagnoses(ALL_DIAGNOSES, criteriaData),
    [criteriaData]
  );

  // Backend state
  const {
    data: evaluation,
    isLoading: isLoadingEvaluation,
  } = useDiagnosisEvaluation(patientRecordId);

  const saveMutation = useSaveDiagnosisEvaluation(patientRecordId);
  const updateMutation = useUpdateDiagnosisDecision(patientRecordId);

  // Track whether we've already initiated sync for this hash to avoid double-fires
  const syncingHashRef = useRef<string | null>(null);

  // Sync: compare hash and save if needed
  useEffect(() => {
    if (!enabled || isLoadingEvaluation) return;

    let cancelled = false;

    async function sync() {
      const hash = await computeSourceDataHash(criteriaData);
      if (cancelled) return;

      // Already syncing this exact hash
      if (syncingHashRef.current === hash) return;

      // Hash matches existing evaluation — no action needed
      if (evaluation?.sourceDataHash === hash) {
        syncingHashRef.current = null;
        return;
      }

      // Hash differs or no evaluation exists — save new results
      syncingHashRef.current = hash;

      const rows = buildResultRows(allResults, patientRecordId);

      saveMutation.mutate(
        {
          oldEvaluationId: evaluation?.id,
          patientRecordId,
          sourceDataHash: hash,
          results: rows,
        },
        {
          onSettled: () => {
            // Allow re-sync if data changes again
            if (syncingHashRef.current === hash) {
              syncingHashRef.current = null;
            }
          },
        }
      );
    }

    sync();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, criteriaData, allResults, evaluation, isLoadingEvaluation, patientRecordId]);

  const updateDecision = useCallback(
    (params: {
      resultId: string;
      practitionerDecision: PractitionerDecision;
      note: string | null;
    }) => {
      updateMutation.mutate({
        resultId: params.resultId,
        practitionerDecision: params.practitionerDecision,
        userId,
        note: params.note,
      });
    },
    [updateMutation, userId]
  );

  return {
    allResults,
    evaluation: evaluation ?? null,
    isSyncing: isLoadingEvaluation || saveMutation.isPending,
    updateDecision,
    isUpdatingDecision: updateMutation.isPending,
  };
}
