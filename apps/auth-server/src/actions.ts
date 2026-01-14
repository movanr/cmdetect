/**
 * Hasura action handlers
 */

import { QUESTIONNAIRE_IDS } from "@cmdetect/questionnaires";
import { Request, Response } from "express";
import { DatabaseService } from "./database";
import { sendActionError, sendActionSuccess } from "./errors";
import {
  validateConsentData,
  validateInviteToken,
  validatePatientPersonalData,
  validateQuestionnaireResponseData,
} from "./validation";

// TODO: 1. Inputs immer parsen mit Zod und du kannst auch von Hasura aus einen Header mitschicken lassen, dass du weißt, dass die Action von Hasura gecalled wird
// TODO (nice-to-have): 2. Scheint mir als könnten fast alle Actions direkt in Hasura gemacht werden mit native Queries die dir dann GraphQL exposen. Vorteil -> Permissions werden gechecked ob korrekt statt wie hier indirekt Superuser Access
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

  // Required questionnaires that must be submitted before marking flow as complete
  private static readonly REQUIRED_QUESTIONNAIRES = QUESTIONNAIRE_IDS;

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

    // Validate response data structure
    const responseValidation = validateQuestionnaireResponseData(response_data);
    if (!responseValidation.valid) {
      return sendActionError(res, responseValidation.error!);
    }

    // Get patient record
    const patientRecord = await this.db.getPatientRecordByInviteToken(invite_token);
    if (!patientRecord) {
      return sendActionError(res, "Invalid or expired invite token");
    }

    // Check if consent exists
    const consent = await this.db.getPatientConsentByRecordId(patientRecord.id);
    if (!consent) {
      return sendActionError(
        res,
        "No consent found for this patient record. Please submit consent first."
      );
    }

    // Build the response payload to store
    const responsePayload = {
      questionnaire_id: response_data.questionnaire_id,
      questionnaire_version: response_data.questionnaire_version,
      answers: response_data.answers,
      submitted_at: new Date().toISOString(),
    };

    // Create questionnaire response
    const responseId = await this.db.createQuestionnaireResponse(
      patientRecord.id,
      consent.id,
      patientRecord.organization_id,
      responsePayload
    );

    // Check if all required questionnaires are now submitted
    const submittedQuestionnaires = await this.db.getSubmittedQuestionnaireIds(patientRecord.id);
    const allComplete = ActionHandlers.REQUIRED_QUESTIONNAIRES.every((id) =>
      submittedQuestionnaires.includes(id)
    );

    if (allComplete) {
      await this.db.markSubmissionComplete(patientRecord.id);
      console.log(
        `All questionnaires submitted for patient record ${patientRecord.id}, marking complete`
      );
    }

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
      message: "Patient personal data submitted successfully",
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
        error_message: tokenValidation.error,
      });
      return;
    }

    // Validate token and get organization details
    const result = await this.db.validateInviteTokenWithPublicKey(invite_token);

    // Log validation attempt (without sensitive data)
    console.log(
      `Invite validation attempt: token=${invite_token ? "present" : "missing"}, valid=${result.valid}`
    );

    // Return the validation result directly
    res.json(result);
  }

  /**
   * Gets patient progress for resume functionality
   */
  async getPatientProgress(req: Request, res: Response): Promise<void> {
    const { invite_token } = req.body.input;

    // Basic token format validation
    const tokenValidation = validateInviteToken(invite_token);
    if (!tokenValidation.valid) {
      res.json({
        valid: false,
        has_consent: false,
        consent_given: false,
        has_personal_data: false,
        submitted_questionnaires: [],
        error_message: tokenValidation.error,
      });
      return;
    }

    // Get patient progress from database
    const result = await this.db.getPatientProgress(invite_token);
    res.json(result);
  }

  /**
   * Resets an invite token (extends expiration, clears completion)
   */
  async resetInviteToken(req: Request, res: Response): Promise<void> {
    const { patient_record_id } = req.body.input;
    const sessionVariables = req.body.session_variables;

    // Get organization ID from session (JWT claim)
    const organizationId = sessionVariables?.["x-hasura-organization-id"];
    if (!organizationId) {
      return sendActionError(res, "Organization ID not found in session");
    }

    // Validate patient_record_id
    if (!patient_record_id || typeof patient_record_id !== "string") {
      return sendActionError(res, "Invalid patient record ID");
    }

    try {
      const newExpiresAt = await this.db.resetInviteToken(patient_record_id, organizationId);

      if (!newExpiresAt) {
        return sendActionError(res, "Patient record not found or access denied");
      }

      sendActionSuccess(res, {
        new_expires_at: newExpiresAt.toISOString(),
      });
    } catch (error) {
      console.error("Error resetting invite token:", error);
      return sendActionError(res, "Failed to reset invite token");
    }
  }
}
