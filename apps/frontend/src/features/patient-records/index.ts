/**
 * Patient Records Feature - Public API
 *
 * This feature consolidates all patient record related logic including:
 * - Types and interfaces
 * - GraphQL queries and mutations
 * - React hooks for data fetching
 * - Status calculation utilities
 * - Filter utilities
 */

// Types
export type { PatientRecord, CaseStatus, InviteStatus } from "./types";

// Queries (for direct use if needed)
export {
  GET_ALL_PATIENT_RECORDS,
  CREATE_PATIENT_RECORD,
  DELETE_PATIENT_RECORD,
} from "./queries";

// Hooks
export { usePatientRecords } from "./hooks/usePatientRecords";
export { useInvites } from "./hooks/useInvites";
export { useSubmissions } from "./hooks/useSubmissions";
export {
  useCreatePatientRecord,
  useDeletePatientRecord,
} from "./hooks/usePatientMutations";

// Utilities
export {
  getCaseStatus,
  getInviteStatus,
  isInviteStatus,
  isSubmissionStatus,
} from "./utils/status";
export { filterSubmissions } from "./utils/filters";

// Components
export { StatusBadge } from "./components/StatusBadge";
