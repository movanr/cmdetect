import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  AUTH_SERVER_URL: z.string().url(),
  HASURA_GRAPHQL_ENDPOINT: z.string().url(),
  FRONTEND_URL: z.string().url(),
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = () => {
  return envSchema.parse(process.env);
};

export const roles = {
  ORG_ADMIN: 'org_admin',
  PHYSICIAN: 'physician',
  RECEPTIONIST: 'receptionist',
  PATIENT_ANONYMOUS: 'patient_anonymous',
  UNVERIFIED: 'unverified',
} as const;

export const roleHierarchy = [roles.ORG_ADMIN, roles.PHYSICIAN, roles.RECEPTIONIST];