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
  if (record.patient_data_completed_at) {
    if (record.viewed) return "viewed";
    return "submitted";
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
export function isInviteStatus(status: string): boolean {
  return [
    "consent_denied",
    "expired",
    "pending",
    "submitted",
    "viewed",
  ].includes(status);
}

/**
 * Check if a status is a submission status (submitted/viewed)
 */
export function isSubmissionStatus(status: string): boolean {
  return ["submitted", "viewed"].includes(status);
}
