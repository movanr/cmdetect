import { createTestClients } from "../setup/graphql-client";
import { TestDataIds } from "../setup/test-data";

describe("Role-Based Access Control", () => {
  let clients: Awaited<ReturnType<typeof createTestClients>>;

  beforeEach(async () => {
    clients = await createTestClients();
  });

  describe("Org Admin Permissions", () => {
    it("org_admin can create new practitioners in their organization", async () => {
      const result = await clients.org1Admin.request<{
        insert_practitioner_one: { id: string; organization_id: string };
      }>(`
        mutation {
          insert_practitioner_one(object: {
            auth_user_id: "new-auth-user"
            email: "new-practitioner@test.com"
            first_name: "New"
            last_name: "Practitioner"
            roles: ["physician"]
          }) {
            id
            organization_id
          }
        }
      `);

      expect(result.insert_practitioner_one).toBeTruthy();
      expect(result.insert_practitioner_one.organization_id).toBe(
        TestDataIds.organizations.org1
      );
    });

    it("org_admin can access all patients in their organization", async () => {
      const patients = await clients.org1Admin.request<{
        patient: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient {
            id
            organization_id
          }
        }
      `);

      // Org admin should see all patients in their organization
      expect(patients.patient).toHaveLength(2);
      expect(
        patients.patient.every(
          (p) => p.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });
  });

  describe("Physician Permissions", () => {
    it("physician can access patients assigned to them via registrations", async () => {
      // First, create a patient registration assigned to the physician
      const registration = {
        organization_id: TestDataIds.organizations.org1,
        patient_id: TestDataIds.patients.org1Patient1,
        created_by_practitioner_id: TestDataIds.practitioners.org1Admin,
        assigned_practitioner_id: TestDataIds.practitioners.org1Physician,
        status: "pending",
      };

      await clients.admin.request(`
        mutation {
          insert_patient_registration_one(object: {
            organization_id: "${registration.organization_id}"
            patient_id: "${registration.patient_id}"
            created_by_practitioner_id: "${registration.created_by_practitioner_id}"
            assigned_practitioner_id: "${registration.assigned_practitioner_id}"
            status: "${registration.status}"
          }) {
            id
          }
        }
      `);

      // Now the physician should be able to access this patient
      const patients = await clients.org1Physician.request<{
        patient: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient {
            id
            organization_id
          }
        }
      `);

      // Physician should only see patients they're assigned to
      expect(
        patients.patient.some((p) => p.id === TestDataIds.patients.org1Patient1)
      ).toBe(true);
    });

    it("physician cannot create new practitioners", async () => {
      const newPractitioner = {
        auth_user_id: "unauthorized-user",
        email: "unauthorized@test.com",
        first_name: "Unauthorized",
        last_name: "User",
        roles: ["physician"],
        organization_id: TestDataIds.organizations.org1,
      };

      // This should fail - physicians cannot create practitioners
      await expect(
        clients.org1Physician.request(`
          mutation {
            insert_practitioner_one(object: {
              auth_user_id: "unauthorized-user"
              email: "unauthorized@test.com"
              first_name: "Unauthorized"
              last_name: "User"
              roles: ["physician"]
              organization_id: "${TestDataIds.organizations.org1}"
            }) {
              id
            }
          }
        `)
      ).rejects.toThrow();
    });
  });

  describe("Receptionist Permissions", () => {
    it("receptionist can create patients in their organization", async () => {
      const newPatient = {
        clinic_internal_id: "P999",
        first_name_encrypted: "encrypted_new",
        last_name_encrypted: "encrypted_patient",
      };

      const result = await clients.org1Receptionist.request<{
        insert_patient_one: { id: string; organization_id: string };
      }>(`
        mutation {
          insert_patient_one(object: {
            clinic_internal_id: "P999"
            first_name_encrypted: "encrypted_new"
            last_name_encrypted: "encrypted_patient"
          }) {
            id
            organization_id
          }
        }
      `);

      expect(result.insert_patient_one).toBeTruthy();
      expect(result.insert_patient_one.organization_id).toBe(
        TestDataIds.organizations.org1
      );
    });

    it("receptionist can access all patients in their organization", async () => {
      const patients = await clients.org1Receptionist.request<{
        patient: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient {
            id
            organization_id
          }
        }
      `);

      // Receptionist should see all patients in their organization
      expect(patients.patient).toHaveLength(2);
      expect(
        patients.patient.every(
          (p) => p.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });

    it("receptionist can create patient_registration with auto-set fields", async () => {
      // Test that receptionist can create patient registrations
      // and that organization_id and created_by_practitioner_id are auto-set from JWT
      const result = await clients.org1Receptionist.request<{
        insert_patient_registration: {
          affected_rows: number;
          returning: Array<{
            id: string;
            organization_id: string;
            patient_id: string;
            created_by_practitioner_id: string;
            notes: string;
          }>;
        };
      }>(`
        mutation {
          insert_patient_registration(objects: [{
            patient_id: "${TestDataIds.patients.org1Patient1}"
            assigned_practitioner_id: "${TestDataIds.practitioners.org1Physician}"
            notes: "Receptionist created registration"
          }]) {
            affected_rows
            returning {
              id
              organization_id
              patient_id
              created_by_practitioner_id
              notes
            }
          }
        }
      `);

      // Verify the registration was created successfully
      expect(result.insert_patient_registration.affected_rows).toBe(1);
      expect(result.insert_patient_registration.returning).toHaveLength(1);

      const registration = result.insert_patient_registration.returning[0];

      // Verify auto-set fields
      expect(registration.organization_id).toBe(TestDataIds.organizations.org1);
      expect(registration.created_by_practitioner_id).toBe(
        TestDataIds.practitioners.org1Receptionist
      );
      expect(registration.patient_id).toBe(TestDataIds.patients.org1Patient1);
    });

    it("receptionist cannot create practitioners", async () => {
      const newPractitioner = {
        auth_user_id: "receptionist-created-user",
        email: "receptionist-created@test.com",
        first_name: "Should",
        last_name: "Fail",
        roles: ["physician"],
        organization_id: TestDataIds.organizations.org1,
      };

      // This should fail - receptionists cannot create practitioners
      await expect(
        clients.org1Receptionist.request(`
          mutation {
            insert_practitioner_one(object: {
              auth_user_id: "receptionist-created-user"
              email: "receptionist-created@test.com"
              first_name: "Should"
              last_name: "Fail"
              roles: ["physician"]
              organization_id: "${TestDataIds.organizations.org1}"
            }) {
              id
            }
          }
        `)
      ).rejects.toThrow();
    });
  });
});
