/**
 * Filter utilities for patient records
 */

import type { PatientRecord } from "../types";
import { getCaseStatus, isSubmissionStatus } from "./status";

/**
 * Filter patient records to only include submissions (submitted, viewed)
 */
export function filterSubmissions(records: PatientRecord[]): PatientRecord[] {
  return records.filter((record) => {
    const status = getCaseStatus(record);
    return isSubmissionStatus(status);
  });
}
