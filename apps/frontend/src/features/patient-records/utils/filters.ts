/**
 * Filter utilities for patient records
 */

import type { PatientRecord } from "../types";
import { getCaseStatus, isInviteStatus, isSubmissionStatus } from "./status";

/**
 * Filter patient records to only include invites (pending, expired, consent_denied)
 */
export function filterInvites(records: PatientRecord[]): PatientRecord[] {
  return records.filter((record) => {
    const status = getCaseStatus(record);
    return isInviteStatus(status);
  });
}

/**
 * Filter patient records to only include submissions (submitted, viewed)
 */
export function filterSubmissions(records: PatientRecord[]): PatientRecord[] {
  return records.filter((record) => {
    const status = getCaseStatus(record);
    return isSubmissionStatus(status);
  });
}
