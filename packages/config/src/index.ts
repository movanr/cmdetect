/**
 * Shared configuration constants for CMDetect
 * Single source of truth for role definitions across all services
 */

export const roles = {
  ORG_ADMIN: "org_admin",
  PHYSICIAN: "physician",
  RECEPTIONIST: "receptionist",
  UNVERIFIED: "unverified",
} as const;

export const roleHierarchy = [
  roles.PHYSICIAN,
  roles.RECEPTIONIST,
  roles.ORG_ADMIN,
];

// Export environment validation
export * from "./env.js";
