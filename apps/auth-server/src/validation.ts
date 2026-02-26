/**
 * Validation utilities for auth server endpoints
 * Uses Zod for runtime validation with type-safe schemas
 */
import { z } from "zod";
import {
  getAnswersSchema,
  checkSQCompletion,
  QUESTIONNAIRE_IDS,
} from "@cmdetect/questionnaires";
import { roleHierarchy } from "@cmdetect/config";
import type { ValidatedRole, OrganizationUserId } from "./types.js";

/**
 * Schema for questionnaire IDs - uses single source of truth from package
 */
const QuestionnaireIdSchema = z.enum(
  QUESTIONNAIRE_IDS as [string, ...string[]]
);

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * UUID validation schema
 */
const UUIDSchema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "Invalid UUID format"
);

/**
 * Validates UUID format
 */
export function validateUUID(uuid: string): boolean {
  return UUIDSchema.safeParse(uuid).success;
}

/**
 * Invite token validation schema
 */
const InviteTokenSchema = z.object({
  invite_token: UUIDSchema,
});

/**
 * Validates invite token format and structure
 */
export function validateInviteToken(invite_token: unknown): ValidationResult {
  const result = InviteTokenSchema.safeParse({ invite_token });
  if (!result.success) {
    return { valid: false, error: "Invalid invite token format" };
  }
  return { valid: true };
}

/**
 * Questionnaire response input schema
 */
const QuestionnaireResponseInputSchema = z.object({
  questionnaire_id: QuestionnaireIdSchema,
  questionnaire_version: z.string().min(1, "questionnaire_version is required"),
  answers: z.record(z.string(), z.unknown()),
});

/**
 * Validates questionnaire response data structure
 * - Validates base structure (questionnaire_id, version, answers)
 * - Validates answers against questionnaire-specific schema
 */
export function validateQuestionnaireResponseData(
  response_data: unknown
): ValidationResult {
  if (
    response_data === undefined ||
    response_data === null ||
    typeof response_data !== "object" ||
    Array.isArray(response_data)
  ) {
    return { valid: false, error: "Invalid response data" };
  }
  // 1. Validate base structure
  const baseResult = QuestionnaireResponseInputSchema.safeParse(response_data);
  if (!baseResult.success) {
    const issue = baseResult.error.issues[0];
    return {
      valid: false,
      error: issue?.message ?? "Invalid response data",
    };
  }

  // 2. Validate answers against questionnaire-specific schema
  const answersSchema = getAnswersSchema(baseResult.data.questionnaire_id);
  const answersResult = answersSchema.safeParse(baseResult.data.answers);
  if (!answersResult.success) {
    const issue = answersResult.error.issues[0];
    return {
      valid: false,
      error: `Invalid answers: ${issue?.message ?? "validation failed"}`,
    };
  }

  return { valid: true };
}

/**
 * Check if SQ is complete and whether screening is negative
 * Used for early completion logic
 */
export function isSQComplete(answers: unknown): {
  complete: boolean;
  screeningNegative: boolean;
} {
  return checkSQCompletion(answers);
}

/**
 * Consent data validation schema
 */
const ConsentDataSchema = z.object({
  consent_given: z.boolean({
    required_error: "consent_given must be a boolean",
    invalid_type_error: "consent_given must be a boolean",
  }),
  consent_text: z.string({
    required_error: "consent_text is required and must be a string",
    invalid_type_error: "consent_text is required and must be a string",
  }).min(1, "consent_text is required and must be a string"),
  consent_version: z.string({
    required_error: "consent_version is required and must be a string",
    invalid_type_error: "consent_version is required and must be a string",
  }).min(1, "consent_version is required and must be a string"),
});

/**
 * Validates patient consent data structure
 */
export function validateConsentData(consent_data: unknown): ValidationResult {
  if (
    consent_data === undefined ||
    consent_data === null ||
    typeof consent_data !== "object" ||
    Array.isArray(consent_data)
  ) {
    return { valid: false, error: "Invalid consent data" };
  }
  const result = ConsentDataSchema.safeParse(consent_data);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { valid: false, error: issue?.message ?? "Invalid consent data" };
  }
  return { valid: true };
}

/**
 * Generic response data schema (minimal validation)
 */
const ResponseDataSchema = z.object({}).passthrough();

/**
 * Validates questionnaire response data structure (minimal)
 */
export function validateResponseData(response_data: unknown): ValidationResult {
  const result = ResponseDataSchema.safeParse(response_data);
  if (!result.success) {
    return { valid: false, error: "Invalid response data" };
  }
  return { valid: true };
}

// Internal schema for app roles (physician, receptionist, org_admin)
const AppRoleSchema = z.enum(roleHierarchy as [string, ...string[]]);

/**
 * Parses and filters an input (e.g. user.roles from DB) into ValidatedRole[].
 * Non-roles and invalid values are silently dropped.
 */
export const ValidRolesSchema = z.preprocess(
  (val) => (Array.isArray(val) ? val : []),
  z
    .array(z.unknown())
    .transform((arr) =>
      arr.flatMap((r) =>
        AppRoleSchema.safeParse(r).success ? [r as ValidatedRole] : []
      )
    )
);

/**
 * Returns a ValidatedRole if role is in the hierarchy, otherwise null.
 */
export function toValidatedRole(role: unknown): ValidatedRole | null {
  const result = AppRoleSchema.safeParse(role);
  return result.success ? (role as ValidatedRole) : null;
}

/**
 * Type-level only: tags a Better Auth user ID as an OrganizationUserId.
 * Better Auth user IDs always belong to organisation users, never patients.
 */
export function toOrganizationUserId(id: string): OrganizationUserId {
  return id as OrganizationUserId;
}

/**
 * Validates role switching request data
 */
export function validateRoleData(role: unknown): ValidationResult {
  const result = z.string().min(1, "Role is required").safeParse(role);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message ?? "Role is required",
    };
  }
  return { valid: true };
}

/**
 * Encrypted patient personal data schema
 */
const PatientPersonalDataSchema = z.object({
  first_name_encrypted: z
    .string({
      required_error: "first_name_encrypted is required and must be a non-empty string",
      invalid_type_error: "first_name_encrypted is required and must be a non-empty string",
    })
    .min(1, "first_name_encrypted is required and must be a non-empty string"),
  last_name_encrypted: z
    .string({
      required_error: "last_name_encrypted is required and must be a non-empty string",
      invalid_type_error: "last_name_encrypted is required and must be a non-empty string",
    })
    .min(1, "last_name_encrypted is required and must be a non-empty string"),
  date_of_birth_encrypted: z
    .string({
      required_error: "date_of_birth_encrypted is required and must be a non-empty string",
      invalid_type_error: "date_of_birth_encrypted is required and must be a non-empty string",
    })
    .min(1, "date_of_birth_encrypted is required and must be a non-empty string"),
});

/**
 * Validates encrypted patient personal data structure
 */
export function validatePatientPersonalData(
  patient_data: unknown
): ValidationResult {
  if (
    patient_data === undefined ||
    patient_data === null ||
    typeof patient_data !== "object" ||
    Array.isArray(patient_data)
  ) {
    return { valid: false, error: "Invalid patient personal data" };
  }
  const result = PatientPersonalDataSchema.safeParse(patient_data);
  if (!result.success) {
    const issue = result.error.issues[0];
    return { valid: false, error: issue?.message ?? "Invalid patient personal data" };
  }
  return { valid: true };
}
