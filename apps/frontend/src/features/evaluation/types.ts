/**
 * Diagnosis Evaluation Types
 *
 * Frontend types for persisted diagnosis results and practitioner decisions.
 */

import type { CriterionStatus, DiagnosisId, Region, Side } from "@cmdetect/dc-tmd";

export type PractitionerDecision = "confirmed" | "rejected" | "added" | null;

export interface PersistedDiagnosisResult {
  id: string;
  diagnosisId: DiagnosisId;
  side: Side;
  region: Region;
  computedStatus: CriterionStatus;
  practitionerDecision: PractitionerDecision;
  decidedBy: string | null;
  decidedAt: string | null;
  note: string | null;
}

export interface PersistedDiagnosisEvaluation {
  id: string;
  patientRecordId: string;
  sourceDataHash: string;
  evaluatedBy: string;
  evaluatedAt: string;
  results: PersistedDiagnosisResult[];
}
