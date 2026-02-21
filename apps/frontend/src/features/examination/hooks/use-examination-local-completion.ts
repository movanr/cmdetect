/**
 * localStorage utility for examination completion marker.
 *
 * Used as an offline/race-condition fallback: after completing an examination,
 * a completion timestamp is stored locally. Route files read this marker when
 * the backend query hasn't resolved yet to avoid premature redirects.
 */

const KEY_PREFIX = "cmdetect_exam_completion_";

export function setLocalExamCompletion(patientRecordId: string, completedAt: string): void {
  try {
    localStorage.setItem(KEY_PREFIX + patientRecordId, completedAt);
  } catch {
    // Ignore storage errors (private mode, quota exceeded, etc.)
  }
}

export function getLocalExamCompletion(patientRecordId: string): string | null {
  try {
    return localStorage.getItem(KEY_PREFIX + patientRecordId);
  } catch {
    return null;
  }
}

export function clearLocalExamCompletion(patientRecordId: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + patientRecordId);
  } catch {
    // Ignore storage errors
  }
}
