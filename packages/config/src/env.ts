/**
 * Centralized environment variable validation using Zod
 * Single source of truth for all environment variables across the monorepo
 */

import { z } from "zod";

/**
 * Base environment schema - common variables used across all services
 */
const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Database environment schema
 */
const databaseEnvSchema = z.object({
  // PostgreSQL connection for Better Auth
  DATABASE_URL: z.url(),

  // PostgreSQL connection for Hasura
  HASURA_DATABASE_URL: z.url(),
});

/**
 * Hasura-specific environment schema
 */
const hasuraEnvSchema = z.object({
  HASURA_GRAPHQL_ENDPOINT: z.string(),
  HASURA_GRAPHQL_ADMIN_SECRET: z.string().min(32),
  HASURA_GRAPHQL_JWT_SECRET: z.string(),
  HASURA_GRAPHQL_UNAUTHORIZED_ROLE: z.string().default("public"),
  HASURA_TEST_ENDPOINT: z.url().optional(),
});

/**
 * Better Auth environment schema
 */
const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  AUTH_SERVER_URL: z.url(),
});

/**
 * Frontend environment schema
 */
const frontendEnvSchema = z.object({
  FRONTEND_URL: z.url(),
});

/**
 * Email/SMTP environment schema
 * All fields are optional for development without email functionality
 */
const emailEnvSchema = z.object({
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.email().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.email().optional(),
});

/**
 * Docker-specific environment schema for Hasura container
 */
const hasuraDockerEnvSchema = z.object({
  POSTGRES_PASSWORD: z.string(),
  DB_URL: z.string(),
  HASURA_ADMIN_SECRET: z.string().min(32),
});

/**
 * Complete environment schema for root .env
 * This is the primary env file for development
 */
export const rootEnvSchema = baseEnvSchema
  .and(databaseEnvSchema)
  .and(hasuraEnvSchema)
  .and(authEnvSchema)
  .and(frontendEnvSchema);

/**
 * Auth server environment schema
 * Extends root with email configuration
 */
export const authServerEnvSchema = baseEnvSchema
  .and(databaseEnvSchema)
  .and(authEnvSchema)
  .and(frontendEnvSchema)
  .and(emailEnvSchema)
  .and(hasuraEnvSchema.pick({ HASURA_GRAPHQL_ADMIN_SECRET: true }));

/**
 * Hasura Docker environment schema
 * For apps/hasura/.env file used by docker-compose
 */
export const hasuraDockerSchema = hasuraDockerEnvSchema.and(
  hasuraEnvSchema.pick({
    HASURA_GRAPHQL_JWT_SECRET: true,
    HASURA_GRAPHQL_UNAUTHORIZED_ROLE: true,
  })
);

/**
 * Test environment schema
 * For running integration tests
 */
export const testEnvSchema = rootEnvSchema.and(
  z.object({
    HASURA_TEST_ENDPOINT: z.url(),
  })
);

/**
 * Validated environment types
 */
export type RootEnv = z.infer<typeof rootEnvSchema>;
export type AuthServerEnv = z.infer<typeof authServerEnvSchema>;
export type HasuraDockerEnv = z.infer<typeof hasuraDockerSchema>;
export type TestEnv = z.infer<typeof testEnvSchema>;

/**
 * Validate environment variables against a schema
 * @param schema - Zod schema to validate against
 * @param env - Environment object to validate (defaults to process.env)
 * @returns Validated and typed environment object
 * @throws ZodError if validation fails
 */
export function validateEnv<T extends z.ZodType>(
  schema: T,
  env: Record<string, unknown> = process.env
): z.infer<T> {
  const result = schema.safeParse(env);

  if (!result.success) {
    const errors = z.treeifyError(result.error);
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(errors, null, 2));
    throw new Error("Environment validation failed");
  }

  return result.data;
}

/**
 * Validate root environment (for development)
 */
export function validateRootEnv(env?: Record<string, unknown>): RootEnv {
  return validateEnv(rootEnvSchema, env);
}

/**
 * Validate auth server environment
 */
export function validateAuthServerEnv(env?: Record<string, unknown>): AuthServerEnv {
  return validateEnv(authServerEnvSchema, env);
}

/**
 * Validate Hasura Docker environment
 */
export function validateHasuraDockerEnv(env?: Record<string, unknown>): HasuraDockerEnv {
  return validateEnv(hasuraDockerSchema, env);
}

/**
 * Validate test environment
 */
export function validateTestEnv(env?: Record<string, unknown>): TestEnv {
  return validateEnv(testEnvSchema, env);
}
