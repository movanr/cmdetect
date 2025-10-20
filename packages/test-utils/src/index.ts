/**
 * Centralized test data definitions
 * Single source of truth for all test entities
 */

import { roles } from "@cmdetect/config";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type TestRole =
  | typeof roles.ORG_ADMIN
  | typeof roles.PHYSICIAN
  | typeof roles.RECEPTIONIST;

export interface TestUser {
  // Auth server credentials
  email: string;
  password: string;

  // Hasura user data
  userId: string;
  organizationId: string;
  roles: TestRole[];
  defaultRole?: TestRole;
  firstName: string;
  lastName: string;
  isActive: boolean;

  // Display/identification
  displayName: string;
}

export interface TestOrganization {
  id: string;
  name: string;
  description: string;
}

// =============================================================================
// ORGANIZATIONS
// =============================================================================

export const TestOrganizations: Record<string, TestOrganization> = {
  org1: {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Test Medical Practice 1",
    description:
      "First test organization for automated integration testing only",
  },
  org2: {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Test Medical Practice 2",
    description:
      "Second test organization for automated isolation testing only",
  },
  org3: {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Manual Test Medical Practice",
    description:
      "Organization for manual frontend testing with real user login flows",
  },
};

// =============================================================================
// TEST USERS
// =============================================================================

export const TestUsers: Record<string, TestUser> = {
  org1Admin: {
    email: "admin1@test.com",
    password: "testPassword123!",
    roles: [roles.ORG_ADMIN],
    defaultRole: roles.ORG_ADMIN,
    organizationId: TestOrganizations.org1.id,
    userId: "8zfoUXwLajI1gI0L4BAW6os3y8fJzwXL",
    firstName: "Admin",
    lastName: "One",
    isActive: true,
    displayName: "Admin One (Org 1)",
  },

  org1Physician: {
    email: "doctor1@test.com",
    password: "testPassword123!",
    roles: [roles.PHYSICIAN],
    defaultRole: roles.PHYSICIAN,
    organizationId: TestOrganizations.org1.id,
    userId: "q2Lo5gunCw5gu0qrBR14qKoPZjDzfeiB",
    firstName: "Doctor",
    lastName: "One",
    isActive: true,
    displayName: "Dr. One (Org 1)",
  },

  org1Receptionist: {
    email: "reception1@test.com",
    password: "testPassword123!",
    roles: [roles.RECEPTIONIST],
    defaultRole: roles.RECEPTIONIST,
    organizationId: TestOrganizations.org1.id,
    userId: "6isMAY5VuGQ4oJsyFctqyeQRk900Kaq1",
    firstName: "Reception",
    lastName: "One",
    isActive: true,
    displayName: "Reception One (Org 1)",
  },

  org2Admin: {
    email: "admin2@test.com",
    password: "testPassword123!",
    roles: [roles.ORG_ADMIN],
    defaultRole: roles.ORG_ADMIN,
    organizationId: TestOrganizations.org2.id,
    userId: "gNPfYwVrE078HxDo9CQwFxbTIzm3uOmq",
    firstName: "Admin",
    lastName: "Two",
    isActive: true,
    displayName: "Admin Two (Org 2)",
  },

  org2Physician: {
    email: "doctor2@test.com",
    password: "testPassword123!",
    roles: [roles.PHYSICIAN, roles.RECEPTIONIST],
    defaultRole: roles.PHYSICIAN,
    organizationId: TestOrganizations.org2.id,
    userId: "ZUS4p8gKfWkGtFsAFK7rrlyJhMB0vU2q",
    firstName: "Doctor",
    lastName: "Two",
    isActive: true,
    displayName: "Dr. Two (Org 2)",
  },
};

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

// Flat ID structure for convenient test access
export const TestDataIds = {
  organizations: {
    org1: TestOrganizations.org1.id,
    org2: TestOrganizations.org2.id,
    org3: TestOrganizations.org3.id,
  },
  users: {
    org1Admin: TestUsers.org1Admin.userId,
    org1Physician: TestUsers.org1Physician.userId,
    org1Receptionist: TestUsers.org1Receptionist.userId,
    org2Admin: TestUsers.org2Admin.userId,
    org2Physician: TestUsers.org2Physician.userId,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all users for a specific organization
 */
export function getUsersForOrganization(
  orgKey: keyof typeof TestOrganizations
): TestUser[] {
  const orgId = TestOrganizations[orgKey].id;
  return Object.values(TestUsers).filter(
    (user) => user.organizationId === orgId
  );
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): TestUser | undefined {
  return Object.values(TestUsers).find((user) => user.email === email);
}

/**
 * Get users by role
 */
export function getUsersByRole(role: TestRole): TestUser[] {
  return Object.values(TestUsers).filter((user) => user.roles.includes(role));
}
