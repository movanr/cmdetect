import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Pool } from "pg";
import { ActionHandlers } from "./actions";
import { auth } from "./auth";
import { AuthEndpoints } from "./auth-endpoints";
import { DatabaseService } from "./database";
import { env } from "./env";
import { handleAsyncError } from "./errors";
import { handlePdfAnamnesisExport } from "./pdf-export";

const app = express();

// Database connection
const dbPool = new Pool({
  connectionString: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST || 'localhost'}:${env.POSTGRES_PORT || 5432}/${env.POSTGRES_DB}`,
});

// Initialize services
const databaseService = new DatabaseService(dbPool);
const actionHandlers = new ActionHandlers(databaseService);
const authEndpoints = new AuthEndpoints(databaseService);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// JSON middleware after auth handler
// Increased limit for PDF export payloads with pain drawing images
app.use(express.json({ limit: "2mb" }));

// Hasura Actions
app.post(
  "/actions/submit-patient-consent",
  handleAsyncError(
    (req, res) => actionHandlers.submitPatientConsent(req, res),
    "Failed to submit consent"
  )
);

app.post(
  "/actions/submit-questionnaire-response",
  handleAsyncError(
    (req, res) => actionHandlers.submitQuestionnaireResponse(req, res),
    "Failed to submit questionnaire response"
  )
);

app.post(
  "/actions/submit-patient-personal-data",
  handleAsyncError(
    (req, res) => actionHandlers.submitPatientPersonalData(req, res),
    "Failed to submit patient personal data"
  )
);

app.post(
  "/actions/validate-invite-token",
  handleAsyncError(
    (req, res) => actionHandlers.validateInviteToken(req, res),
    "Failed to validate invite token"
  )
);

app.post(
  "/actions/get-patient-progress",
  handleAsyncError(
    (req, res) => actionHandlers.getPatientProgress(req, res),
    "Failed to get patient progress"
  )
);

// Authentication endpoints
app.post(
  "/api/auth/switch-role",
  handleAsyncError((req, res) => authEndpoints.switchRole(req, res), "Failed to switch role")
);

// PDF Export endpoint
app.post(
  "/api/pdf/anamnesis",
  handleAsyncError(handlePdfAnamnesisExport, "Failed to generate PDF")
);

// Auth routes (must be after custom routes)
app.all("/api/auth/*splat", toNodeHandler(auth));

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "OK", service: "cmdetect-auth-server" });
});

// Global error handler for Express middleware errors (including JSON parsing)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Handle JSON parsing errors from express.json() middleware
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      error: "Invalid JSON format in request body",
    });
  }

  // Log unexpected errors
  console.error("Unexpected server error:", err);

  // Send generic error response
  res.status(500).json({
    error: "Internal server error",
  });
});

app.listen(3001, "0.0.0.0", () => {
  console.log(`Auth server running on 0.0.0.0:3001`);
});
