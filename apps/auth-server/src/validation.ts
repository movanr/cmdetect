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
 * Validates FHIR QuestionnaireResponse resource according to FHIR spec
 */
export function validateFHIRQuestionnaireResponse(fhir_resource: any): ValidationResult {
  if (!fhir_resource || typeof fhir_resource !== 'object') {
    return { valid: false, error: "FHIR resource must be an object" };
  }

  // Validate resourceType
  if (fhir_resource.resourceType !== 'QuestionnaireResponse') {
    return { valid: false, error: "resourceType must be 'QuestionnaireResponse'" };
  }

  // Validate questionnaire field (required)
  if (!fhir_resource.questionnaire || typeof fhir_resource.questionnaire !== 'string') {
    return { valid: false, error: "questionnaire field is required and must be a string" };
  }

  // Validate status field (required)
  if (!fhir_resource.status || typeof fhir_resource.status !== 'string') {
    return { valid: false, error: "status field is required and must be a string" };
  }

  // Validate status values according to FHIR spec
  const validStatuses = ['in-progress', 'completed', 'amended', 'entered-in-error', 'stopped'];
  if (!validStatuses.includes(fhir_resource.status)) {
    return { valid: false, error: `status must be one of: ${validStatuses.join(', ')}` };
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