/**
 * Centralized test data definitions
 * Single source of truth for all test entities
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface TestUser {
  // Auth server credentials
  email: string;
  password: string;

  // Hasura user data
  userId: string;
  organizationId: string;
  roles: ("org_admin" | "physician" | "receptionist")[];
  defaultRole?: "org_admin" | "physician" | "receptionist";
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
    roles: ["org_admin"],
    defaultRole: "org_admin",
    organizationId: TestOrganizations.org1.id,
    userId: "4gLI1mnAaxP91SdpIDWmPf8RDKou5vHC",
    firstName: "Admin",
    lastName: "One",
    isActive: true,
    displayName: "Admin One (Org 1)",
  },

  org1Physician: {
    email: "doctor1@test.com",
    password: "testPassword123!",
    roles: ["physician"],
    defaultRole: "physician",
    organizationId: TestOrganizations.org1.id,
    userId: "zm8ZjF4Cg4MXLV0Zr8OrnwLBR6uk3WFH",
    firstName: "Doctor",
    lastName: "One",
    isActive: true,
    displayName: "Dr. One (Org 1)",
  },

  org1Receptionist: {
    email: "reception1@test.com",
    password: "testPassword123!",
    roles: ["receptionist"],
    defaultRole: "receptionist",
    organizationId: TestOrganizations.org1.id,
    userId: "5QPtVmZcr5BP8PIiC857t9vY8IvKw5Jm",
    firstName: "Reception",
    lastName: "One",
    isActive: true,
    displayName: "Reception One (Org 1)",
  },

  org2Admin: {
    email: "admin2@test.com",
    password: "testPassword123!",
    roles: ["org_admin"],
    defaultRole: "org_admin",
    organizationId: TestOrganizations.org2.id,
    userId: "tTCZiLMVjxYP5Wrez4pLdUxmkTN5eg9G",
    firstName: "Admin",
    lastName: "Two",
    isActive: true,
    displayName: "Admin Two (Org 2)",
  },

  org2Physician: {
    email: "doctor2@test.com",
    password: "testPassword123!",
    roles: ["physician", "receptionist"],
    defaultRole: "physician",
    organizationId: TestOrganizations.org2.id,
    userId: "6QKaX1K6pEqILvHwGVkhwN0HICMqDKFW",
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
export function getUsersByRole(
  role: "org_admin" | "physician" | "receptionist"
): TestUser[] {
  return Object.values(TestUsers).filter((user) => user.roles.includes(role));
}
