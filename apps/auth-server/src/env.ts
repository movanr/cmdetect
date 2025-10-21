/**
 * Centralized environment configuration for auth server
 *
 * This module:
 * 1. Loads .env file from monorepo root (only once)
 * 2. Validates environment variables with Zod
 * 3. Exports typed env object for use throughout the app
 */

import { validateAuthServerEnv, type AuthServerEnv } from "@cmdetect/config";
import dotenv from "dotenv";
import { resolve } from "path";

// Load environment from root .env file
// __dirname when compiled will be in dist/, so we go up to apps/auth-server, then to root
dotenv.config({ path: resolve(__dirname, "../../../.env") });

// Validate environment variables once
export const env: AuthServerEnv = validateAuthServerEnv();

// Log successful validation (helpful for debugging)
console.log("Environment variables validated successfully");
