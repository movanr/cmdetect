// Auth types
export interface UserMetadata {
  roles?: string[];
  organizationId?: string;
  practitionerId?: string;
}

export interface JWTClaims {
  'x-hasura-default-role': string;
  'x-hasura-allowed-roles': string[];
  'x-hasura-roles': string[];
  'x-hasura-user-id': string;
  'x-hasura-organization-id'?: string;
  'x-hasura-practitioner-id'?: string;
  'x-hasura-registration-id'?: string;
  'x-hasura-generated-by'?: string;
}

// Database types
export interface Organization {
  id: string;
  name: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Practitioner {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  organization_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientRegistration {
  id: string;
  organization_id: string;
  patient_id: string;
  created_by_practitioner_id: string;
  assigned_practitioner_id: string;
  status: 'pending' | 'consent_pending' | 'consent_denied' | 'submitted' | 'cancelled' | 'expired';
  workflow_status: 'not_started' | 'new_submission' | 'under_review' | 'examination_started' | 'examination_complete' | 'diagnosed' | 'case_closed' | 'archived';
  created_at: string;
  updated_at: string;
}

// API types
export interface GeneratePatientTokenRequest {
  registrationId: string;
}

export interface GeneratePatientTokenResponse {
  token: string;
  submissionUrl: string;
  expiresAt: string;
}