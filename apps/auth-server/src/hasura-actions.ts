import express from "express";
import { Pool } from "pg";

const router = express.Router();

// Hasura database connection pool
const hasuraPool = new Pool({
  connectionString: process.env.HASURA_DATABASE_URL!,
  // Fallback to individual parameters if connection string fails
  host: process.env.HASURA_DB_HOST,
  port: parseInt(process.env.HASURA_DB_PORT || "5432"),
  database: process.env.HASURA_DB_NAME,
  user: process.env.HASURA_DB_USER,
  password: process.env.HASURA_DB_PASSWORD,
});

// Hasura Admin Client for authenticated operations
const hasuraAdminRequest = async (query: string, variables = {}) => {
  const response = await fetch(process.env.HASURA_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(`Hasura error: ${JSON.stringify(result.errors)}`);
  }
  return result.data;
};

// Validate link token and get registration details
async function validateLinkToken(linkToken: string) {
  const client = await hasuraPool.connect();
  try {
    const result = await client.query(
      `
      SELECT 
        pr.id,
        pr.organization_id,
        pr.patient_id,
        pr.status,
        pr.link_expires_at,
        p.clinic_internal_id
      FROM patient_registration pr
      JOIN patient p ON pr.patient_id = p.id
      WHERE pr.link_token = $1 
        AND pr.deleted_at IS NULL
        AND pr.link_expires_at > NOW()
        AND pr.status = 'pending'
    `,
      [linkToken]
    );

    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Types for request/response (matching Hasura action signature)
interface PatientConsentInput {
  consent_given: boolean;
  consent_text: string;
  consent_version: string;
  ip_address?: string;
  user_agent?: string;
}

interface QuestionnaireResponseInput {
  questionnaire: string;
  fhir_resource: any;
}

interface SubmitPatientAnamnesisArgs {
  link_token: string;
  consent_data: PatientConsentInput;
  questionnaire_responses: QuestionnaireResponseInput[];
}

interface HasuraActionRequest {
  action: {
    name: string;
  };
  input: SubmitPatientAnamnesisArgs;
}

// Main action handler
router.post("/submit-patient-anamnesis", async (req, res) => {
  try {
    const { input }: HasuraActionRequest = req.body;
    const { link_token, consent_data, questionnaire_responses } = input;

    // Extract client info from forwarded headers
    const clientIP =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Validate required inputs
    if (
      !link_token ||
      !consent_data ||
      !questionnaire_responses ||
      !Array.isArray(questionnaire_responses)
    ) {
      return res.status(400).json({
        message: "Missing required fields or invalid anamnesis data format",
        extensions: {
          code: "VALIDATION_ERROR",
        },
      });
    }

    // Validate anamnesis questionnaire responses array
    if (questionnaire_responses.length === 0) {
      return res.status(400).json({
        message: "At least one anamnesis questionnaire response is required",
        extensions: {
          code: "VALIDATION_ERROR",
        },
      });
    }

    // Validate each anamnesis questionnaire response
    for (const response of questionnaire_responses) {
      if (!response.questionnaire || !response.fhir_resource) {
        return res.status(400).json({
          message:
            "Each anamnesis questionnaire response must have questionnaire and fhir_resource",
          extensions: {
            code: "VALIDATION_ERROR",
          },
        });
      }
    }

    // Validate link token
    const registration = await validateLinkToken(link_token);
    if (!registration) {
      return res.status(400).json({
        message: "Invalid, expired, or already used link token",
        extensions: {
          code: "INVALID_LINK_TOKEN",
        },
      });
    }

    // Check if consent and anamnesis data already exist
    const existingData = await hasuraAdminRequest(
      `
      query CheckExisting($registration_id: uuid!) {
        patient_consent(where: {patient_registration_id: {_eq: $registration_id}}) {
          id
        }
        questionnaire_response(
          where: {
            patient_registration_id: {_eq: $registration_id}
          }
        ) {
          id
          fhir_resource
        }
      }
    `,
      {
        registration_id: registration.id,
      }
    );

    if (existingData.patient_consent.length > 0) {
      return res.status(400).json({
        message: "Consent already provided for this registration",
        extensions: {
          code: "ALREADY_SUBMITTED",
        },
      });
    }

    if (existingData.questionnaire_response.length > 0) {
      const existingQuestionnaires = existingData.questionnaire_response
        .map((q: any) => q.fhir_resource.questionnaire)
        .filter(Boolean);

      const requestedQuestionnaires = questionnaire_responses.map(
        (q) => q.questionnaire
      );
      const duplicateQuestionnaires = existingQuestionnaires.filter(
        (existing: string) => requestedQuestionnaires.includes(existing)
      );

      if (duplicateQuestionnaires.length > 0) {
        return res.status(400).json({
          message: `Some anamnesis questionnaires already submitted: ${duplicateQuestionnaires.join(
            ", "
          )}`,
          extensions: {
            code: "PARTIALLY_SUBMITTED",
            existing_questionnaires: duplicateQuestionnaires,
          },
        });
      }
    }

    // Prepare consent data with audit info
    const consentInput = {
      patient_registration_id: registration.id,
      organization_id: registration.organization_id,
      consent_given: consent_data.consent_given,
      consent_text: consent_data.consent_text,
      consent_version: consent_data.consent_version,
      ip_address: consent_data.ip_address || clientIP,
      user_agent: consent_data.user_agent || userAgent,
      consented_at: new Date().toISOString(),
    };

    // First, insert consent to get the consent_id
    const consentResult = await hasuraAdminRequest(
      `
      mutation InsertConsent($consentInput: patient_consent_insert_input!) {
        insert_patient_consent_one(object: $consentInput) {
          id
          consent_given
        }
      }
    `,
      { consentInput }
    );

    const consentId = consentResult.insert_patient_consent_one.id;

    // Prepare questionnaire response data array with consent_id
    const questionnaireInputs = questionnaire_responses.map((response) => {
      // Ensure FHIR resource contains questionnaire reference
      const fhirResource = {
        ...response.fhir_resource,
        questionnaire: response.questionnaire,
      };

      return {
        patient_registration_id: registration.id,
        organization_id: registration.organization_id,
        patient_consent_id: consentId,
        fhir_resource: fhirResource,
        submitted_at: new Date().toISOString(),
      };
    });

    // Build dynamic mutation for multiple questionnaire responses
    const questionnaireMutations = questionnaireInputs
      .map(
        (_, index) =>
          `response_${index}: insert_questionnaire_response_one(object: $questionnaireInput_${index}) {
        id
        fhir_resource
        submitted_at
      }`
      )
      .join("\n        ");

    // Build variables object
    const variables: any = {
      registrationId: registration.id,
    };

    // Add questionnaire variables
    questionnaireInputs.forEach((input, index) => {
      variables[`questionnaireInput_${index}`] = input;
    });

    // Insert questionnaire responses and update registration
    const mutation = `
      mutation SubmitAnamnesisData(
        ${questionnaireInputs
          .map(
            (_, index) =>
              `$questionnaireInput_${index}: questionnaire_response_insert_input!`
          )
          .join("\n        ")}
        $registrationId: uuid!
      ) {
        # Insert all questionnaire responses
        ${questionnaireMutations}
        
        # Update registration status - this will be handled by database triggers
        # but we'll update last_activity_at manually
        registration: update_patient_registration_by_pk(
          pk_columns: { id: $registrationId }
          _set: {
            last_activity_at: "now()"
            updated_at: "now()"
          }
        ) {
          id
          status
          workflow_status
        }
      }
    `;

    await hasuraAdminRequest(mutation, variables);

    // Success response
    const submittedQuestionnaires = questionnaire_responses.map(
      (q) => q.questionnaire
    );

    res.json({
      success: true,
      registration_id: registration.id,
      message: consent_data.consent_given
        ? `Successfully submitted anamnesis with ${
            submittedQuestionnaires.length
          } questionnaire(s): ${submittedQuestionnaires.join(", ")}`
        : "Consent declined - registration updated",
      submitted_questionnaires: submittedQuestionnaires,
      errors: [],
    });
  } catch (error) {
    console.error("Patient anamnesis submission error:", error);

    res.status(500).json({
      message: "Internal server error during submission",
      extensions: {
        code: "INTERNAL_ERROR",
      },
    });
  }
});

// Health check endpoint
router.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
