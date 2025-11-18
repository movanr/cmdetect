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

// TODO (https://github.com/t3-oss/t3-env): Kann insecure sein, parse das hier mit Zod oder so statt die ganze .env mitzuschleppen nicht dass du die ausversehen iwo mitsendest
// TODO (nice-to-have): Die Variable solltest du auch taggen mit nem Symbol und bei jeder Response solltest du das JSON durchgehen und wenn der Tag gefunden wird es rausfiltern
// TODO (nice-to-have): Auch wichtig wenn du Logs schreibst, dass du den String im Logger abgleichen kannst zum redacten, ggf gibts da n Tool für. Sonst landet mal dein BETTER_AUTH_SECRET iwo in Logs
export const env = process.env;
