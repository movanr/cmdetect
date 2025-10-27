/**
 * Environment configuration for auth server
 *
 * This module:
 * 1. Loads .env file from monorepo root (only once)
 * 2. Exports env object for use throughout the app
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load environment from root .env file
// __dirname when compiled will be in dist/, so we go up to apps/auth-server, then to root
dotenv.config({ path: resolve(__dirname, "../../../.env") });

// Export environment variables (type will be inferred from process.env)
export const env = process.env;
