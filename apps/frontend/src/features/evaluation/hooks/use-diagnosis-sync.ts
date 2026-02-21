/**
 * Diagnosis Sync Hook
 *
 * Orchestrates client-side diagnosis evaluation with backend persistence.
 * - Computes diagnoses client-side via evaluateAllDiagnoses
 * - Upserts computed_status to backend (preserves practitioner decisions on conflict)
 * - Provides mutation for practitioner decisions
 */

import { useCallback, useEffect, useMemo } from "react";
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
import { useDiagnosisResults } from "./use-diagnosis-evaluation";
import {
  useUpsertDiagnosisResults,
  useUpdateDiagnosisDecision,
} from "./use-save-diagnosis-evaluation";
import type { PersistedDiagnosisResult, PractitionerDecision } from "../types";

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
  /** Persisted results from backend */
  results: PersistedDiagnosisResult[];
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
  const { data: results, isLoading: isLoadingResults } = useDiagnosisResults(patientRecordId);

  const upsertMutation = useUpsertDiagnosisResults(patientRecordId);
  const updateMutation = useUpdateDiagnosisDecision(patientRecordId);

  // Sync: upsert computed results whenever criteria data changes
  useEffect(() => {
    if (!enabled || isLoadingResults || upsertMutation.isPending) return;

    const rows = buildResultRows(allResults, patientRecordId);
    upsertMutation.mutate(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteriaData, allResults, enabled]);

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
    results: results ?? [],
    isSyncing: isLoadingResults || upsertMutation.isPending,
    updateDecision,
    isUpdatingDecision: updateMutation.isPending,
  };
}
