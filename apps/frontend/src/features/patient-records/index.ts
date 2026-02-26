/**
 * Patient Records Feature - Public API
 *
 * This feature consolidates all patient record related logic including:
 * - Types and interfaces
 * - GraphQL queries and mutations
 * - React hooks for data fetching
 * - Status calculation utilities
 */

// Types
export type { PatientRecord, CaseStatus, InviteStatus } from "./types";

// Queries (for direct use if needed)
export {
  GET_ALL_PATIENT_RECORDS,
  CREATE_PATIENT_RECORD,
  DELETE_PATIENT_RECORD,
  RESET_INVITE_TOKEN,
  GET_QUESTIONNAIRE_RESPONSES,
} from "./queries";

// Hooks
export { usePatientRecords } from "./hooks/usePatientRecords";
export { useInvites } from "./hooks/useInvites";
export { useSubmissions } from "./hooks/useSubmissions";
export {
  useCreatePatientRecord,
  useDeletePatientRecord,
  useResetInviteToken,
} from "./hooks/usePatientMutations";

// Utilities
export {
  getCaseStatus,
  getInviteStatus,
  isInviteStatus,
  isSubmissionStatus,
} from "./utils/status";

// Components
export { StatusBadge } from "./components/StatusBadge";
