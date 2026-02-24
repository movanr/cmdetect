import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { Pool } from "pg";
import { ActionHandlers } from "./actions.js";
import { auth } from "./auth.js";
import { AuthEndpoints } from "./auth-endpoints.js";
import { DatabaseService } from "./database.js";
import { env } from "./env.js";

const app = new Hono();

// Database connection
const dbPool = new Pool({
  connectionString: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
});

// Initialize services
const databaseService = new DatabaseService(dbPool);
const actionHandlers = new ActionHandlers(databaseService);
const authEndpoints = new AuthEndpoints(databaseService);

// Middleware
app.use(secureHeaders());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Secret header validation for Hasura actions
app.use("/actions/*", async (c, next) => {
  const secret = env.HASURA_ACTION_SECRET;
  if (secret) {
    const header = c.req.header("x-hasura-action-secret");
    if (header !== secret) {
      return c.json({ message: "Unauthorized" }, 401);
    }
  } else {
    console.warn("HASURA_ACTION_SECRET not set — action secret validation disabled");
  }
  await next();
});

// Hasura Actions
app.post("/actions/submit-patient-consent", (c) =>
  actionHandlers.submitPatientConsent(c)
);
app.post("/actions/submit-questionnaire-response", (c) =>
  actionHandlers.submitQuestionnaireResponse(c)
);
app.post("/actions/submit-patient-personal-data", (c) =>
  actionHandlers.submitPatientPersonalData(c)
);
app.post("/actions/validate-invite-token", (c) =>
  actionHandlers.validateInviteToken(c)
);
app.post("/actions/get-patient-progress", (c) =>
  actionHandlers.getPatientProgress(c)
);

// Authentication endpoints (registered before Better Auth wildcard)
app.post("/api/auth/switch-role", (c) => authEndpoints.switchRole(c));

// Better Auth routes (must be after custom routes)
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Health check
app.get("/health", (c) =>
  c.json({ status: "OK", service: "cmdetect-auth-server" })
);

// Global error handler
app.onError((err, c) => {
  if (err instanceof SyntaxError) {
    return c.json({ error: "Invalid JSON format in request body" }, 400);
  }
  console.error("Unexpected server error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

serve({ fetch: app.fetch, port: 3001, hostname: "0.0.0.0" }, (info) => {
  console.log(`Auth server running on 0.0.0.0:${info.port}`);
});
