import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { Pool } from "pg";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection for actions
const db = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Validation helper functions
function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && uuidRegex.test(uuid);
}

function validateInviteToken(invite_token: any): { valid: boolean; error?: string } {
  if (!invite_token || typeof invite_token !== 'string') {
    return { valid: false, error: "Invalid invite token format" };
  }
  if (!validateUUID(invite_token)) {
    return { valid: false, error: "Invalid invite token format" };
  }
  return { valid: true };
}

function validateFHIRQuestionnaireResponse(fhir_resource: any): { valid: boolean; error?: string } {
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

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// JSON middleware after auth handler
app.use(express.json());

// Hasura Actions
app.post("/actions/submit-patient-consent", async (req, res) => {
  try {
    const { invite_token, consent_data } = req.body.input;

    // Input validation
    const tokenValidation = validateInviteToken(invite_token);
    if (!tokenValidation.valid) {
      return res.json({
        success: false,
        error: tokenValidation.error,
      });
    }

    // Validate consent_data
    if (!consent_data || typeof consent_data !== "object") {
      return res.json({
        success: false,
        error: "Invalid consent data",
      });
    }

    if (typeof consent_data.consent_given !== "boolean") {
      return res.json({
        success: false,
        error: "consent_given must be a boolean",
      });
    }

    if (
      !consent_data.consent_text ||
      typeof consent_data.consent_text !== "string"
    ) {
      return res.json({
        success: false,
        error: "consent_text is required and must be a string",
      });
    }

    if (
      !consent_data.consent_version ||
      typeof consent_data.consent_version !== "string"
    ) {
      return res.json({
        success: false,
        error: "consent_version is required and must be a string",
      });
    }

    // Validate invite token and get patient record
    const patientRecordQuery = `
      SELECT id, organization_id, patient_id 
      FROM patient_record 
      WHERE invite_token = $1 
      AND invite_expires_at > NOW() 
          `;

    const patientRecordsResult = await db.query(patientRecordQuery, [
      invite_token,
    ]);
    const patientRecords = patientRecordsResult.rows;

    if (patientRecords.length === 0) {
      return res.json({
        success: false,
        error: "Invalid or expired invite token",
      });
    }

    const patientRecord = patientRecords[0];

    // Upsert patient consent (insert or update if consent already exists)
    const consentQuery = `
      INSERT INTO patient_consent (
        patient_record_id, organization_id, consent_given, 
        consent_text, consent_version, ip_address, user_agent, consented_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
      ON CONFLICT (patient_record_id) 
      DO UPDATE SET 
        consent_given = EXCLUDED.consent_given,
        consent_text = EXCLUDED.consent_text,
        consent_version = EXCLUDED.consent_version,
        ip_address = EXCLUDED.ip_address,
        user_agent = EXCLUDED.user_agent,
        consented_at = EXCLUDED.consented_at,
        updated_at = NOW()
      RETURNING id
    `;

    const consentQueryResult = await db.query(consentQuery, [
      patientRecord.id,
      patientRecord.organization_id,
      consent_data.consent_given,
      consent_data.consent_text,
      consent_data.consent_version,
      consent_data.ip_address || req.ip,
      consent_data.user_agent || req.get("User-Agent"),
    ]);

    res.json({
      success: true,
      patient_consent_id: consentQueryResult.rows[0].id,
    });
  } catch (error) {
    console.error("Error in submitPatientConsent:", error);
    res.json({
      success: false,
      error: "Failed to submit consent",
    });
  }
});

app.post("/actions/submit-questionnaire-response", async (req, res) => {
  try {
    const { invite_token, response_data } = req.body.input;

    // Input validation
    const tokenValidation = validateInviteToken(invite_token);
    if (!tokenValidation.valid) {
      return res.json({
        success: false,
        error: tokenValidation.error,
      });
    }

    // Validate response_data
    if (!response_data || typeof response_data !== "object") {
      return res.json({
        success: false,
        error: "Invalid response data",
      });
    }


    // Validate FHIR resource
    const fhirValidation = validateFHIRQuestionnaireResponse(response_data.fhir_resource);
    if (!fhirValidation.valid) {
      return res.json({
        success: false,
        error: fhirValidation.error,
      });
    }

    // Validate invite token and get patient record
    const patientRecordQuery = `
      SELECT id, organization_id, patient_id 
      FROM patient_record 
      WHERE invite_token = $1 
      AND invite_expires_at > NOW() 
          `;

    const patientRecordsResult = await db.query(patientRecordQuery, [
      invite_token,
    ]);
    const patientRecords = patientRecordsResult.rows;

    if (patientRecords.length === 0) {
      return res.json({
        success: false,
        error: "Invalid or expired invite token",
      });
    }

    const patientRecord = patientRecords[0];

    // Find consent for this patient record
    const consentQuery = `
      SELECT id FROM patient_consent 
      WHERE patient_record_id = $1
    `;

    const consentsResult = await db.query(consentQuery, [patientRecord.id]);
    const consents = consentsResult.rows;

    if (consents.length === 0) {
      return res.json({
        success: false,
        error: "No consent found for this patient record. Please submit consent first.",
      });
    }

    const consentId = consents[0].id;

    // Insert questionnaire response
    const responseQuery = `
      INSERT INTO questionnaire_response (
        patient_record_id, patient_consent_id, organization_id, 
        fhir_resource, submitted_at
      ) VALUES ($1, $2, $3, $4, NOW()) 
      RETURNING id
    `;

    const responseQueryResult = await db.query(responseQuery, [
      patientRecord.id,
      consentId,
      patientRecord.organization_id,
      response_data.fhir_resource,
    ]);

    res.json({
      success: true,
      questionnaire_response_id: responseQueryResult.rows[0].id,
    });
  } catch (error) {
    console.error("Error in submitQuestionnaireResponse:", error);
    res.json({
      success: false,
      error: "Failed to submit questionnaire response",
    });
  }
});

// Role switching endpoint - database-based approach
app.post("/api/auth/switch-role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || typeof role !== 'string') {
      return res.status(400).json({
        error: "Role is required and must be a string"
      });
    }

    // Get current session using Better Auth
    const sessionResult = await auth.api.getSession({
      headers: new Headers(req.headers as HeadersInit)
    });

    if (!sessionResult || !sessionResult.user) {
      return res.status(401).json({
        error: "Invalid session"
      });
    }

    const user = sessionResult.user;
    const userRoles = (user.roles as string[]) || [];

    // Validate that user has the requested role
    if (!userRoles.includes(role)) {
      return res.status(403).json({
        error: `You don't have permission to switch to role: ${role}`
      });
    }

    // Update user's active role in database
    await db.query(
      'UPDATE "user" SET "activeRole" = $1 WHERE id = $2',
      [role, user.id]
    );

    console.log(`User ${user.email} switched to role: ${role}`);

    res.json({
      success: true,
      activeRole: role,
      availableRoles: userRoles,
      message: "Role switched successfully. Please refresh your session to get a new token."
    });

  } catch (error) {
    console.error("Error switching role:", error);
    res.status(500).json({
      error: "Failed to switch role"
    });
  }
});

// Auth routes (must be after custom routes)
app.all("/api/auth/*splat", toNodeHandler(auth));

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "OK", service: "hasura-auth-server" });
});

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
