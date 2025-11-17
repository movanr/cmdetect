import { createTestClients } from "../setup/graphql-client";
import { TestDataIds } from "@cmdetect/test-utils";

describe("Role-Based Access Control", () => {
  let clients: Awaited<ReturnType<typeof createTestClients>>;

  beforeEach(async () => {
    clients = await createTestClients();
  });

  describe("Org Admin Permissions", () => {
    // TODO: User creation should go through Better Auth webhook/API, not direct Hasura mutations
    // Remove this test until webhook is implemented

    it("org_admin can access all patient records in their organization", async () => {
      const records = await clients.org1Admin.request<{
        patient_record: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      // Org admin should see all patient records in their organization
      expect(
        records.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });
  });

  describe("Physician Permissions", () => {
    it("physician can access patient records created by them", async () => {
      // First, create a patient record created by the physician
      const createdRecord = await clients.admin.request<{
        insert_patient_record_one: { id: string };
      }>(`
        mutation {
          insert_patient_record_one(object: {
            organization_id: "${TestDataIds.organizations.org1}"
            clinic_internal_id: "P-PHYSICIAN-ACCESS-TEST"
            created_by: "${TestDataIds.users.org1Physician}"
          }) {
            id
          }
        }
      `);

      // Now the physician should be able to access this patient record
      const records = await clients.org1Physician.request<{
        patient_record: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      // Physician should only see records created by them in their organization
      expect(
        records.patient_record.some(
          (r) => r.id === createdRecord.insert_patient_record_one.id
        )
      ).toBe(true);
      expect(
        records.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });

    it("physician cannot create new users", async () => {
      // This should fail - physicians cannot create users
      await expect(
        clients.org1Physician.request(`
          mutation {
            insert_user_one(object: {
              email: "unauthorized@test.com"
              name: "Unauthorized User"
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
    it("receptionist can create patient records in their organization", async () => {
      const result = await clients.org1Receptionist.request<{
        insert_patient_record_one: { id: string; organization_id: string };
      }>(`
        mutation {
          insert_patient_record_one(object: {
            clinic_internal_id: "P999-RECEPTIONIST-TEST"
          }) {
            id
            organization_id
          }
        }
      `);

      expect(result.insert_patient_record_one).toBeTruthy();
      expect(result.insert_patient_record_one.organization_id).toBe(
        TestDataIds.organizations.org1
      );
    });

    it("receptionist can access all patient records in their organization", async () => {
      const records = await clients.org1Receptionist.request<{
        patient_record: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      // Receptionist should see all patient records in their organization
      expect(
        records.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });

    it("receptionist can create patient_record with auto-set fields", async () => {
      // Test that receptionist can create patient records
      // and that organization_id and created_by are auto-set from JWT
      const result = await clients.org1Receptionist.request<{
        insert_patient_record: {
          affected_rows: number;
          returning: Array<{
            id: string;
            organization_id: string;
            clinic_internal_id: string;
            created_by: string;
          }>;
        };
      }>(`
        mutation {
          insert_patient_record(objects: [{
            clinic_internal_id: "P-AUTO-FIELDS-TEST"
          }]) {
            affected_rows
            returning {
              id
              organization_id
              clinic_internal_id
              created_by
            }
          }
        }
      `);

      // Verify the record was created successfully
      expect(result.insert_patient_record.affected_rows).toBe(1);
      expect(result.insert_patient_record.returning).toHaveLength(1);

      const record = result.insert_patient_record.returning[0];

      // Verify auto-set fields
      expect(record.organization_id).toBe(TestDataIds.organizations.org1);
      expect(record.created_by).toBe(TestDataIds.users.org1Receptionist);
      expect(record.clinic_internal_id).toBe("P-AUTO-FIELDS-TEST");
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
  // TODO: Würde auf jeden Fall ein paar Tests haben für Public User, dass die Tables die er nicht accessen darf immer sofort failen (Schema Error von Hasura weil anders).
  // TODO: Eigl ist es deklarativ genug mit Hasura, ggf kannst du auch die YAML File parsen für die Tables und checken
});
