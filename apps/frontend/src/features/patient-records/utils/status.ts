/**
 * Status calculation utilities
 */

import type { PatientRecord, CaseStatus, InviteStatus } from "../types";

/**
 * Calculate the status of a patient record for cases view
 */
export function getCaseStatus(record: PatientRecord): CaseStatus {
  if (record.patient_consent?.consent_given === false) {
    return "consent_denied";
  }
  // Only show as a case when full submission is complete (all questionnaires submitted)
  if (record.submission_completed_at) {
    if (record.viewed) return "viewed";
    return "new";
  }
  if (
    record.invite_expires_at &&
    new Date(record.invite_expires_at) <= new Date()
  ) {
    return "expired";
  }
  return "pending";
}

/**
 * Calculate the status of a patient record for invites view
 */
export function getInviteStatus(record: PatientRecord): InviteStatus {
  const status = getCaseStatus(record);
  if (
    status === "consent_denied" ||
    status === "expired" ||
    status === "pending"
  ) {
    return status;
  }
  return "submitted";
}

/**
 * Check if a status is an invite status (not yet submitted)
 */
export function isInviteStatus(): boolean {
  return true;
}

/**
 * Check if a status is a submission status (submitted/viewed)
 */
export function isSubmissionStatus(status: string): boolean {
  return ["new", "viewed"].includes(status);
}
