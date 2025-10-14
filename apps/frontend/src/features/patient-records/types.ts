/**
 * Patient Records Feature Types
 */

import type { GetAllPatientRecordsQuery } from "@/graphql/graphql";

// Core types
export type PatientRecord = GetAllPatientRecordsQuery["patient_record"][number];

// Status types
export type CaseStatus =
  | "pending"
  | "new"
  | "viewed"
  | "expired"
  | "consent_denied";
export type InviteStatus =
  | "pending"
  | "submitted"
  | "expired"
  | "consent_denied";
