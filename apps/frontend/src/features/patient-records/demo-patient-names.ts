import type { PatientPII } from "@/crypto/types";

/**
 * Hardcoded patient names for demo cases (is_demo=true).
 * Demo cases have no encrypted PII — these names are displayed instead.
 * Keyed by clinic_internal_id (e.g. "DEMO-001").
 *
 * Must be kept in sync with apps/hasura/seeds/demo-cases/*.json
 */
export const DEMO_PATIENT_NAMES: Record<string, PatientPII> = {
  "DEMO-001": { firstName: "Marie", lastName: "Mustermann", dateOfBirth: "1985-07-15" },
  "DEMO-002": { firstName: "Thomas", lastName: "Beispiel", dateOfBirth: "1972-03-22" },
};

export const DEMO_PATIENT_FALLBACK: PatientPII = {
  firstName: "Demo",
  lastName: "Patient",
  dateOfBirth: "2000-01-01",
};

export function getDemoPatientName(clinicInternalId: string): PatientPII {
  return DEMO_PATIENT_NAMES[clinicInternalId] ?? DEMO_PATIENT_FALLBACK;
}
