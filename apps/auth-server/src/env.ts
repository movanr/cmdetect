/**
 * Environment configuration for auth server
 *
 * This module:
 * 1. Loads .env file from monorepo root (only once)
 * 2. Validates required variables at startup via Zod
 * 3. Exports a typed env object (only declared variables, not all of process.env)
 */

import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment from root .env file
// __dirname when compiled will be in dist/, so we go up to apps/auth-server, then to root
dotenv.config({ path: resolve(__dirname, "../../../.env") });

const EnvSchema = z.object({
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.string().default("5432"),
  BETTER_AUTH_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url(),
  PATIENT_FRONTEND_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  HASURA_ACTION_SECRET: z.string().min(1).optional(),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;

// TODO (nice-to-have): Die Variable solltest du auch taggen mit nem Symbol und bei jeder Response solltest du das JSON durchgehen und wenn der Tag gefunden wird es rausfiltern
// TODO (nice-to-have): Auch wichtig wenn du Logs schreibst, dass du den String im Logger abgleichen kannst zum redacten, ggf gibts da n Tool für. Sonst landet mal dein BETTER_AUTH_SECRET iwo in Logs
