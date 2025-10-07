/**
 * Database access layer for auth server
 */

import { Pool } from 'pg';

export interface PatientRecord {
  id: string;
  organization_id: string;
  clinic_internal_id: string;
  patient_data_completed_at?: Date;
}

export interface PatientConsent {
  id: string;
  patient_record_id: string;
  organization_id: string;
  consent_given: boolean;
  consent_text: string;
  consent_version: string;
}

export interface QuestionnaireResponse {
  id: string;
  patient_record_id: string;
  patient_consent_id: string;
  organization_id: string;
  fhir_resource: any;
}

export interface InviteValidationResult {
  valid: boolean;
  organization_name?: string;
  public_key_pem?: string;
  patient_record_id?: string;
  expires_at?: string;
  error_message?: string;
}

/**
 * Database service for managing patient records, consent, and questionnaire responses
 */
export class DatabaseService {
  constructor(private db: Pool) {}

  /**
   * Retrieves a valid patient record by invite token
   */
  async getPatientRecordByInviteToken(inviteToken: string): Promise<PatientRecord | null> {
    const query = `
      SELECT id, organization_id, clinic_internal_id, patient_data_completed_at 
      FROM patient_record 
      WHERE invite_token = $1 
      AND invite_expires_at > NOW()
      AND deleted_at IS NULL
    `;

    const result = await this.db.query(query, [inviteToken]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Creates or updates patient consent
   */
  async upsertPatientConsent(
    patientRecordId: string,
    organizationId: string,
    consentGiven: boolean,
    consentText: string,
    consentVersion: string
  ): Promise<string> {
    const query = `
      INSERT INTO patient_consent (
        patient_record_id, organization_id, consent_given, 
        consent_text, consent_version, consented_at
      ) VALUES ($1, $2, $3, $4, $5, NOW()) 
      ON CONFLICT (patient_record_id) 
      DO UPDATE SET 
        consent_given = EXCLUDED.consent_given,
        consent_text = EXCLUDED.consent_text,
        consent_version = EXCLUDED.consent_version,
        consented_at = EXCLUDED.consented_at,
        updated_at = NOW()
      RETURNING id
    `;

    const result = await this.db.query(query, [
      patientRecordId,
      organizationId,
      consentGiven,
      consentText,
      consentVersion,
    ]);

    return result.rows[0].id;
  }

  /**
   * Retrieves patient consent by patient record ID
   */
  async getPatientConsentByRecordId(patientRecordId: string): Promise<{ id: string } | null> {
    const query = `
      SELECT id FROM patient_consent 
      WHERE patient_record_id = $1
    `;

    const result = await this.db.query(query, [patientRecordId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Creates a new questionnaire response
   */
  async createQuestionnaireResponse(
    patientRecordId: string,
    patientConsentId: string,
    organizationId: string,
    fhirResource: any
  ): Promise<string> {
    const query = `
      INSERT INTO questionnaire_response (
        patient_record_id, patient_consent_id, organization_id, 
        fhir_resource, submitted_at
      ) VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING id
    `;

    const result = await this.db.query(query, [
      patientRecordId,
      patientConsentId,
      organizationId,
      fhirResource,
    ]);

    return result.rows[0].id;
  }

  /**
   * Updates user's active role
   */
  async updateUserActiveRole(userId: string, role: string): Promise<void> {
    const query = 'UPDATE "user" SET "activeRole" = $1 WHERE id = $2';
    await this.db.query(query, [role, userId]);
  }

  /**
   * Updates patient record with encrypted personal data
   */
  async updatePatientPersonalData(
    patientRecordId: string,
    firstNameEncrypted: string,
    lastNameEncrypted: string,
    dateOfBirthEncrypted: string
  ): Promise<void> {
    const query = `
      UPDATE patient_record
      SET first_name_encrypted = $2,
          last_name_encrypted = $3,
          date_of_birth_encrypted = $4,
          patient_data_completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      AND deleted_at IS NULL
    `;

    await this.db.query(query, [
      patientRecordId,
      firstNameEncrypted,
      lastNameEncrypted,
      dateOfBirthEncrypted,
    ]);
  }

  /**
   * Validates invite token and returns organization details for patient encryption
   */
  async validateInviteTokenWithPublicKey(inviteToken: string): Promise<InviteValidationResult> {
    try {
      const query = `
        SELECT
          pr.id as patient_record_id,
          pr.invite_expires_at,
          pr.patient_data_completed_at,
          o.name as organization_name,
          o.public_key_pem
        FROM patient_record pr
        JOIN organization o ON pr.organization_id = o.id
        WHERE pr.invite_token = $1
          AND pr.deleted_at IS NULL
          AND o.deleted_at IS NULL
      `;

      const result = await this.db.query(query, [inviteToken]);

      if (result.rows.length === 0) {
        return {
          valid: false,
          error_message: "Invalid invite link"
        };
      }

      const row = result.rows[0];

      // Check if patient data has already been completed
      if (row.patient_data_completed_at) {
        return {
          valid: false,
          error_message: "This invite has already been used. Patient data has been submitted."
        };
      }

      // Check if token has expired
      if (new Date(row.invite_expires_at) <= new Date()) {
        return {
          valid: false,
          error_message: "Invite link has expired"
        };
      }

      // Check if organization has a public key configured
      if (!row.public_key_pem) {
        return {
          valid: false,
          error_message: "Organization encryption not configured"
        };
      }

      return {
        valid: true,
        organization_name: row.organization_name,
        public_key_pem: row.public_key_pem,
        patient_record_id: row.patient_record_id,
        expires_at: row.invite_expires_at.toISOString()
      };

    } catch (error) {
      console.error('Database error during invite validation:', error);
      return {
        valid: false,
        error_message: "Database error occurred during validation"
      };
    }
  }
}