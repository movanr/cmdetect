import { createTestClients } from "../setup/graphql-client";
import { TestDataIds } from "../setup/test-data";

describe("Role-Based Access Control", () => {
  let clients: Awaited<ReturnType<typeof createTestClients>>;

  beforeEach(async () => {
    clients = await createTestClients();
  });

  describe("Org Admin Permissions", () => {
    // TODO: User creation should go through Better Auth webhook/API, not direct Hasura mutations
    // Remove this test until webhook is implemented

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
      const registrationData = {
        organization_id: TestDataIds.organizations.org1,
        patient_id: TestDataIds.patients.org1Patient1,
        created_by: TestDataIds.users.org1Admin,
        assigned_to: TestDataIds.users.org1Physician,
        status: "pending",
      };

      await clients.admin.request(`
        mutation {
          insert_patient_record_one(object: {
            organization_id: "${registrationData.organization_id}"
            patient_id: "${registrationData.patient_id}"
            created_by: "${registrationData.created_by}"
            assigned_to: "${registrationData.assigned_to}"
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

    it("physician cannot create new users", async () => {
      // This should fail - physicians cannot create users
      await expect(
        clients.org1Physician.request(`
          mutation {
            insert_user_one(object: {
              email: "unauthorized@test.com"
              firstName: "Unauthorized"
              lastName: "User"
              roles: ["physician"]
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

      // Clean up the created patient to not interfere with subsequent tests
      await clients.admin.request(`
        mutation {
          delete_patient_by_pk(id: "${result.insert_patient_one.id}") {
            id
          }
        }
      `);
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

    it("receptionist can create patient_record with auto-set fields", async () => {
      // Test that receptionist can create patient registrations
      // and that organization_id and created_by are auto-set from JWT
      const result = await clients.org1Receptionist.request<{
        insert_patient_record: {
          affected_rows: number;
          returning: Array<{
            id: string;
            organization_id: string;
            patient_id: string;
            created_by: string;
            notes: string;
          }>;
        };
      }>(`
        mutation {
          insert_patient_record(objects: [{
            patient_id: "${TestDataIds.patients.org1Patient1}"
            assigned_to: "${TestDataIds.users.org1Physician}"
            notes: "Receptionist created registration"
          }]) {
            affected_rows
            returning {
              id
              organization_id
              patient_id
              created_by
              notes
            }
          }
        }
      `);

      // Verify the registration was created successfully
      expect(result.insert_patient_record.affected_rows).toBe(1);
      expect(result.insert_patient_record.returning).toHaveLength(1);

      const registration = result.insert_patient_record.returning[0];

      // Verify auto-set fields
      expect(registration.organization_id).toBe(TestDataIds.organizations.org1);
      expect(registration.created_by).toBe(TestDataIds.users.org1Receptionist);
      expect(registration.patient_id).toBe(TestDataIds.patients.org1Patient1);
    });

    it("receptionist cannot create users", async () => {
      // This should fail - receptionists cannot create users
      await expect(
        clients.org1Receptionist.request(`
          mutation {
            insert_user_one(object: {
              email: "receptionist-created@test.com"
              firstName: "Should"
              lastName: "Fail"
              roles: ["physician"]
            }) {
              id
            }
          }
        `)
      ).rejects.toThrow();
    });
  });
});
