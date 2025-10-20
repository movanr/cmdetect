import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { Pool } from "pg";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { DatabaseService } from "./database";
import { ActionHandlers } from "./actions";
import { AuthEndpoints } from "./auth-endpoints";
import { handleAsyncError } from "./errors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Initialize services
const databaseService = new DatabaseService(dbPool);
const actionHandlers = new ActionHandlers(databaseService);
const authEndpoints = new AuthEndpoints(databaseService);

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

// Authentication endpoints
app.post(
  "/api/auth/switch-role",
  handleAsyncError(
    (req, res) => authEndpoints.switchRole(req, res),
    "Failed to switch role"
  )
);

// Auth routes (must be after custom routes)
app.all("/api/auth/*splat", toNodeHandler(auth));

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "OK", service: "hasura-auth-server" });
});

// Global error handler for Express middleware errors (including JSON parsing)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Handle JSON parsing errors from express.json() middleware
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: "Invalid JSON format in request body"
    });
  }

  // Log unexpected errors
  console.error('Unexpected server error:', err);

  // Send generic error response
  res.status(500).json({
    error: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
