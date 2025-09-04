/**
 * Database access layer for auth server
 */

import { Pool } from 'pg';

export interface PatientRecord {
  id: string;
  organization_id: string;
  patient_id: string;
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
      SELECT id, organization_id, patient_id 
      FROM patient_record 
      WHERE invite_token = $1 
      AND invite_expires_at > NOW()
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
}