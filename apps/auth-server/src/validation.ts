// TODO: Das sollte alles Zod sein. Zu viel Potential Fehler zu haben.

/**
 * Validation utilities for auth server endpoints
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && uuidRegex.test(uuid);
}

/**
 * Validates invite token format and structure
 */
export function validateInviteToken(invite_token: any): ValidationResult {
  if (!invite_token || typeof invite_token !== 'string') {
    return { valid: false, error: "Invalid invite token format" };
  }
  if (!validateUUID(invite_token)) {
    return { valid: false, error: "Invalid invite token format" };
  }
  return { valid: true };
}

/**
 * Known questionnaire IDs that the system accepts
 */
const KNOWN_QUESTIONNAIRE_IDS = ['dc-tmd-sq', 'phq-4'];

/**
 * Validates questionnaire response data structure
 */
export function validateQuestionnaireResponseData(response_data: any): ValidationResult {
  if (!response_data || typeof response_data !== 'object') {
    return { valid: false, error: "Response data must be an object" };
  }

  // Validate questionnaire_id
  if (!response_data.questionnaire_id || typeof response_data.questionnaire_id !== 'string') {
    return { valid: false, error: "questionnaire_id is required and must be a string" };
  }

  if (!KNOWN_QUESTIONNAIRE_IDS.includes(response_data.questionnaire_id)) {
    return { valid: false, error: `Unknown questionnaire_id. Must be one of: ${KNOWN_QUESTIONNAIRE_IDS.join(', ')}` };
  }

  // Validate questionnaire_version
  if (!response_data.questionnaire_version || typeof response_data.questionnaire_version !== 'string') {
    return { valid: false, error: "questionnaire_version is required and must be a string" };
  }

  // Validate answers
  if (!response_data.answers || typeof response_data.answers !== 'object') {
    return { valid: false, error: "answers is required and must be an object" };
  }

  // Ensure answers is not empty
  if (Object.keys(response_data.answers).length === 0) {
    return { valid: false, error: "answers cannot be empty" };
  }

  return { valid: true };
}

/**
 * Validates patient consent data structure
 */
export function validateConsentData(consent_data: any): ValidationResult {
  if (!consent_data || typeof consent_data !== "object") {
    return { valid: false, error: "Invalid consent data" };
  }

  if (typeof consent_data.consent_given !== "boolean") {
    return { valid: false, error: "consent_given must be a boolean" };
  }

  if (!consent_data.consent_text || typeof consent_data.consent_text !== "string") {
    return { valid: false, error: "consent_text is required and must be a string" };
  }

  if (!consent_data.consent_version || typeof consent_data.consent_version !== "string") {
    return { valid: false, error: "consent_version is required and must be a string" };
  }

  return { valid: true };
}

/**
 * Validates questionnaire response data structure
 */
export function validateResponseData(response_data: any): ValidationResult {
  if (!response_data || typeof response_data !== "object") {
    return { valid: false, error: "Invalid response data" };
  }

  return { valid: true };
}

/**
 * Validates role switching request data
 */
export function validateRoleData(role: any): ValidationResult {
  if (!role || typeof role !== 'string') {
    return { valid: false, error: "Role is required and must be a string" };
  }

  return { valid: true };
}

/**
 * Validates encrypted patient personal data structure
 */
export function validatePatientPersonalData(patient_data: any): ValidationResult {
  if (!patient_data || typeof patient_data !== "object") {
    return { valid: false, error: "Invalid patient personal data" };
  }

  // Validate all required encrypted fields
  if (!patient_data.first_name_encrypted || typeof patient_data.first_name_encrypted !== "string" || patient_data.first_name_encrypted.trim().length === 0) {
    return { valid: false, error: "first_name_encrypted is required and must be a non-empty string" };
  }

  if (!patient_data.last_name_encrypted || typeof patient_data.last_name_encrypted !== "string" || patient_data.last_name_encrypted.trim().length === 0) {
    return { valid: false, error: "last_name_encrypted is required and must be a non-empty string" };
  }

  if (!patient_data.date_of_birth_encrypted || typeof patient_data.date_of_birth_encrypted !== "string" || patient_data.date_of_birth_encrypted.trim().length === 0) {
    return { valid: false, error: "date_of_birth_encrypted is required and must be a non-empty string" };
  }

  return { valid: true };
}