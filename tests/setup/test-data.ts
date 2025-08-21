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

  // Hasura practitioner data
  practitionerId: string;
  organizationId: string;
  role: "org_admin" | "physician" | "receptionist";
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

export interface TestPatient {
  id: string;
  organizationId: string;
  clinicInternalId: string;
  firstNameEncrypted: string;
  lastNameEncrypted: string;
  dateOfBirthEncrypted?: string;
  genderEncrypted?: string;
}

export interface TestRegistration {
  id: string;
  organizationId: string;
  patientId: string;
  createdByPractitionerId: string;
  assignedPractitionerId: string;
  status: string;
  workflowStatus: string;
}

// =============================================================================
// ORGANIZATIONS
// =============================================================================

export const TestOrganizations: Record<string, TestOrganization> = {
  org1: {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Test Medical Practice 1",
    description: "First test organization for multi-tenant testing",
  },
  org2: {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Test Medical Practice 2",
    description: "Second test organization for isolation testing",
  },
};

// =============================================================================
// TEST USERS (PRACTITIONERS)
// =============================================================================

export const TestUsers: Record<string, TestUser> = {
  org1Admin: {
    email: "admin1@test.com",
    password: "testPassword123!",
    role: "org_admin",
    organizationId: TestOrganizations.org1.id,
    practitionerId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    firstName: "Admin",
    lastName: "One",
    isActive: true,
    displayName: "Admin One (Org 1)",
  },

  org1Physician: {
    email: "doctor1@test.com",
    password: "testPassword123!",
    role: "physician",
    organizationId: TestOrganizations.org1.id,
    practitionerId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    firstName: "Doctor",
    lastName: "One",
    isActive: true,
    displayName: "Dr. One (Org 1)",
  },

  org1Receptionist: {
    email: "reception1@test.com",
    password: "testPassword123!",
    role: "receptionist",
    organizationId: TestOrganizations.org1.id,
    practitionerId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    firstName: "Reception",
    lastName: "One",
    isActive: true,
    displayName: "Reception One (Org 1)",
  },

  org2Admin: {
    email: "admin2@test.com",
    password: "testPassword123!",
    role: "org_admin",
    organizationId: TestOrganizations.org2.id,
    practitionerId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    firstName: "Admin",
    lastName: "Two",
    isActive: true,
    displayName: "Admin Two (Org 2)",
  },

  org2Physician: {
    email: "doctor2@test.com",
    password: "testPassword123!",
    role: "physician",
    organizationId: TestOrganizations.org2.id,
    practitionerId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    firstName: "Doctor",
    lastName: "Two",
    isActive: true,
    displayName: "Dr. Two (Org 2)",
  },
};

// =============================================================================
// TEST PATIENTS
// =============================================================================

export const TestPatients: Record<string, TestPatient> = {
  org1Patient1: {
    id: "f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1",
    organizationId: TestOrganizations.org1.id,
    clinicInternalId: "P001",
    firstNameEncrypted: "encrypted_john",
    lastNameEncrypted: "encrypted_doe",
    dateOfBirthEncrypted: "encrypted_1990-01-01",
    genderEncrypted: "encrypted_male",
  },

  org1Patient2: {
    id: "f2f2f2f2-f2f2-f2f2-f2f2-f2f2f2f2f2f2",
    organizationId: TestOrganizations.org1.id,
    clinicInternalId: "P002",
    firstNameEncrypted: "encrypted_jane",
    lastNameEncrypted: "encrypted_smith",
    dateOfBirthEncrypted: "encrypted_1985-05-15",
    genderEncrypted: "encrypted_female",
  },

  org2Patient1: {
    id: "f3f3f3f3-f3f3-f3f3-f3f3-f3f3f3f3f3f3",
    organizationId: TestOrganizations.org2.id,
    clinicInternalId: "P101",
    firstNameEncrypted: "encrypted_alice",
    lastNameEncrypted: "encrypted_wilson",
    dateOfBirthEncrypted: "encrypted_1982-12-10",
    genderEncrypted: "encrypted_female",
  },
};

// =============================================================================
// TEST REGISTRATIONS
// =============================================================================

export const TestRegistrations: Record<string, TestRegistration> = {
  org1Registration1: {
    id: "r1r1r1r1-r1r1-r1r1-r1r1-r1r1r1r1r1r1",
    organizationId: TestOrganizations.org1.id,
    patientId: TestPatients.org1Patient1.id,
    createdByPractitionerId: TestUsers.org1Receptionist.practitionerId,
    assignedPractitionerId: TestUsers.org1Physician.practitionerId,
    status: "pending",
    workflowStatus: "new_submission",
  },

  org1Registration2: {
    id: "r2r2r2r2-r2r2-r2r2-r2r2-r2r2r2r2r2r2",
    organizationId: TestOrganizations.org1.id,
    patientId: TestPatients.org1Patient2.id,
    createdByPractitionerId: TestUsers.org1Admin.practitionerId,
    assignedPractitionerId: TestUsers.org1Physician.practitionerId,
    status: "consent_pending",
    workflowStatus: "under_review",
  },

  org2Registration1: {
    id: "r3r3r3r3-r3r3-r3r3-r3r3-r3r3r3r3r3r3",
    organizationId: TestOrganizations.org2.id,
    patientId: TestPatients.org2Patient1.id,
    createdByPractitionerId: TestUsers.org2Admin.practitionerId,
    assignedPractitionerId: TestUsers.org2Physician.practitionerId,
    status: "submitted",
    workflowStatus: "completed",
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
  },
  practitioners: {
    org1Admin: TestUsers.org1Admin.practitionerId,
    org1Physician: TestUsers.org1Physician.practitionerId,
    org1Receptionist: TestUsers.org1Receptionist.practitionerId,
    org2Admin: TestUsers.org2Admin.practitionerId,
    org2Physician: TestUsers.org2Physician.practitionerId,
  },
  patients: {
    org1Patient1: TestPatients.org1Patient1.id,
    org1Patient2: TestPatients.org1Patient2.id,
    org2Patient1: TestPatients.org2Patient1.id,
  },
  registrations: {
    org1Registration1: TestRegistrations.org1Registration1.id,
    org1Registration2: TestRegistrations.org1Registration2.id,
    org2Registration1: TestRegistrations.org2Registration1.id,
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
 * Get all patients for a specific organization
 */
export function getPatientsForOrganization(
  orgKey: keyof typeof TestOrganizations
): TestPatient[] {
  const orgId = TestOrganizations[orgKey].id;
  return Object.values(TestPatients).filter(
    (patient) => patient.organizationId === orgId
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
export function getUsersByRole(role: TestUser["role"]): TestUser[] {
  return Object.values(TestUsers).filter((user) => user.role === role);
}
