/**
 * Hasura action handlers
 */

import { Request, Response } from 'express';
import { DatabaseService } from './database';
import { 
  validateInviteToken, 
  validateConsentData, 
  validateResponseData, 
  validateFHIRQuestionnaireResponse,
  validatePatientPersonalData 
} from './validation';
import { sendActionError, sendActionSuccess } from './errors';

export class ActionHandlers {
  constructor(private db: DatabaseService) {}

  /**
   * Handles patient consent submission
   */
  async submitPatientConsent(req: Request, res: Response): Promise<void> {
    const { invite_token, consent_data } = req.body.input;

    // Validate invite token
    const tokenValidation = validateInviteToken(invite_token);
    if (!tokenValidation.valid) {
      return sendActionError(res, tokenValidation.error!);
    }

    // Validate consent data
    const consentValidation = validateConsentData(consent_data);
    if (!consentValidation.valid) {
      return sendActionError(res, consentValidation.error!);
    }

    // Get patient record
    const patientRecord = await this.db.getPatientRecordByInviteToken(invite_token);
    if (!patientRecord) {
      return sendActionError(res, "Invalid or expired invite token");
    }

    // Upsert patient consent
    const consentId = await this.db.upsertPatientConsent(
      patientRecord.id,
      patientRecord.organization_id,
      consent_data.consent_given,
      consent_data.consent_text,
      consent_data.consent_version
    );

    sendActionSuccess(res, { patient_consent_id: consentId });
  }

  /**
   * Handles questionnaire response submission
   */
  async submitQuestionnaireResponse(req: Request, res: Response): Promise<void> {
    const { invite_token, response_data } = req.body.input;

    // Validate invite token
    const tokenValidation = validateInviteToken(invite_token);
    if (!tokenValidation.valid) {
      return sendActionError(res, tokenValidation.error!);
    }

    // Validate response data
    const responseValidation = validateResponseData(response_data);
    if (!responseValidation.valid) {
      return sendActionError(res, responseValidation.error!);
    }

    // Validate FHIR resource
    const fhirValidation = validateFHIRQuestionnaireResponse(response_data.fhir_resource);
    if (!fhirValidation.valid) {
      return sendActionError(res, fhirValidation.error!);
    }

    // Get patient record
    const patientRecord = await this.db.getPatientRecordByInviteToken(invite_token);
    if (!patientRecord) {
      return sendActionError(res, "Invalid or expired invite token");
    }

    // Check if consent exists
    const consent = await this.db.getPatientConsentByRecordId(patientRecord.id);
    if (!consent) {
      return sendActionError(res, "No consent found for this patient record. Please submit consent first.");
    }

    // Create questionnaire response
    const responseId = await this.db.createQuestionnaireResponse(
      patientRecord.id,
      consent.id,
      patientRecord.organization_id,
      response_data.fhir_resource
    );

    sendActionSuccess(res, { questionnaire_response_id: responseId });
  }

  /**
   * Handles patient personal information submission
   */
  async submitPatientPersonalData(req: Request, res: Response): Promise<void> {
    const { invite_token, patient_data } = req.body.input;

    // Validate invite token
    const tokenValidation = validateInviteToken(invite_token);
    if (!tokenValidation.valid) {
      return sendActionError(res, tokenValidation.error!);
    }

    // Validate patient personal data
    const personalDataValidation = validatePatientPersonalData(patient_data);
    if (!personalDataValidation.valid) {
      return sendActionError(res, personalDataValidation.error!);
    }

    // Get patient record
    const patientRecord = await this.db.getPatientRecordByInviteToken(invite_token);
    if (!patientRecord) {
      return sendActionError(res, "Invalid or expired invite token");
    }

    // Check if patient data is already completed
    if (patientRecord.patient_data_completed_at) {
      return sendActionError(res, "Patient personal data has already been completed");
    }

    // Update patient record with encrypted personal data
    await this.db.updatePatientPersonalData(
      patientRecord.id,
      patient_data.first_name_encrypted,
      patient_data.last_name_encrypted,
      patient_data.date_of_birth_encrypted
    );

    sendActionSuccess(res, { 
      patient_record_id: patientRecord.id,
      message: "Patient personal data submitted successfully" 
    });
  }

  /**
   * Validates invite token and returns organization public key for encryption
   */
  async validateInviteToken(req: Request, res: Response): Promise<void> {
    const { invite_token } = req.body.input;

    // Basic token format validation
    const tokenValidation = validateInviteToken(invite_token);
    if (!tokenValidation.valid) {
      res.json({
        valid: false,
        error_message: tokenValidation.error
      });
      return;
    }

    // Validate token and get organization details
    const result = await this.db.validateInviteTokenWithPublicKey(invite_token);
    
    // Log validation attempt (without sensitive data)
    console.log(`Invite validation attempt: token=${invite_token ? 'present' : 'missing'}, valid=${result.valid}`);

    // Return the validation result directly
    res.json(result);
  }
}