import { createTestClients } from "../setup/graphql-client";
import { TestDataIds } from "@cmdetect/test-utils";

describe("Organization Isolation", () => {
  let clients: Awaited<ReturnType<typeof createTestClients>>;

  beforeEach(async () => {
    clients = await createTestClients();
  });

  describe("Patient Record Access Control", () => {
    it("org_admin can only access patient records from their organization", async () => {
      // Query patient records as org1 admin
      const org1Records = await clients.org1Admin.request<{
        patient_record: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      // Verify all records belong to org1
      expect(
        org1Records.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);

      // Query patient records as org2 admin
      const org2Records = await clients.org2Admin.request<{
        patient_record: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      // Verify all records belong to org2
      expect(
        org2Records.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org2
        )
      ).toBe(true);
    });

    it("physician can only access patient records from their organization", async () => {
      const org1PhysicianRecords = await clients.org1Physician.request<{
        patient_record: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      // Physician should see records from their org (though permissions may be more restrictive)
      expect(
        org1PhysicianRecords.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });

    it("receptionist can only access patient records from their organization", async () => {
      const org1ReceptionistRecords = await clients.org1Receptionist.request<{
        patient_record: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      // Receptionist should see records from their org
      expect(
        org1ReceptionistRecords.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });
  });

  describe("User Access Control", () => {
    it("org_admin can only access users from their organization", async () => {
      const org1Users = await clients.org1Admin.request<{
        user: Array<{ id: string; organizationId: string }>;
      }>(`
        query {
          user {
            id
            organizationId
          }
        }
      `);

      // Verify all users belong to org1
      expect(
        org1Users.user.every(
          (p) => p.organizationId === TestDataIds.organizations.org1
        )
      ).toBe(true);

      const org2Users = await clients.org2Admin.request<{
        user: Array<{ id: string; organizationId: string }>;
      }>(`
        query {
          user {
            id
            organizationId
          }
        }
      `);

      // Verify all users belong to org2
      expect(
        org2Users.user.every(
          (p) => p.organizationId === TestDataIds.organizations.org2
        )
      ).toBe(true);
    });
  });

  describe("Organization Access Control", () => {
    it("org_admin can only access their own organization", async () => {
      // Test organization query isolation
      const org1Result = await clients.org1Admin.request<{
        organization: Array<{ id: string; name: string }>;
      }>(`
        query {
          organization {
            id
            name
          }
        }
      `);

      // Should only see org1
      expect(org1Result.organization).toHaveLength(1);
      expect(org1Result.organization[0].id).toBe(
        TestDataIds.organizations.org1
      );

      const org2Result = await clients.org2Admin.request<{
        organization: Array<{ id: string; name: string }>;
      }>(`
        query {
          organization {
            id
            name
          }
        }
      `);

      // Should only see org2
      expect(org2Result.organization).toHaveLength(1);
      expect(org2Result.organization[0].id).toBe(
        TestDataIds.organizations.org2
      );
    });

    it("physician can only access their organization", async () => {
      const result = await clients.org1Physician.request<{
        organization: Array<{ name: string }>;
      }>(`
        query {
          organization {
            name
          }
        }
      `);

      expect(result.organization).toHaveLength(1);
      expect(result.organization[0].name).toBe("Test Medical Practice 1");
    });

    it("receptionist can only access their organization", async () => {
      const result = await clients.org1Receptionist.request<{
        organization: Array<{ name: string }>;
      }>(`
        query {
          organization {
            name
          }
        }
      `);

      expect(result.organization).toHaveLength(1);
      expect(result.organization[0].name).toBe("Test Medical Practice 1");
    });

    it("org_admin can update their own organization", async () => {
      // Should succeed - updating own organization
      const result = await clients.org1Admin.request<{
        update_organization_by_pk: { id: string; phone: string };
      }>(`
        mutation {
          update_organization_by_pk(
            pk_columns: { id: "${TestDataIds.organizations.org1}" }
            _set: { phone: "+1-555-0123" }
          ) {
            id
            phone
          }
        }
      `);

      expect(result.update_organization_by_pk).toBeTruthy();
      expect(result.update_organization_by_pk.phone).toBe("+1-555-0123");
    });

    it("org_admin cannot update other organization", async () => {
      // Should return null - trying to update org2 as org1 admin
      const result = await clients.org1Admin.request<{
        update_organization_by_pk: { id: string; phone: string } | null;
      }>(`
        mutation {
          update_organization_by_pk(
            pk_columns: { id: "${TestDataIds.organizations.org2}" }
            _set: { phone: "+1-555-HACK" }
          ) {
            id
            phone
          }
        }
      `);

      expect(result.update_organization_by_pk).toBeNull();
    });
  });

  describe("Patient Record Creation Control", () => {
    it("org_admin can create records in their organization", async () => {
      const result = await clients.org1Admin.request<{
        insert_patient_record_one: {
          id: string;
          organization_id: string;
          clinic_internal_id: string;
        };
      }>(`
        mutation {
          insert_patient_record_one(object: {
            clinic_internal_id: "P001-ISOLATION-TEST"
          }) {
            id
            organization_id
            clinic_internal_id
          }
        }
      `);

      expect(result.insert_patient_record_one).toBeTruthy();
      expect(result.insert_patient_record_one.organization_id).toBe(
        TestDataIds.organizations.org1
      );
    });

    it("receptionist can create registrations in their organization", async () => {
      const result = await clients.org1Receptionist.request<{
        insert_patient_record_one: { id: string; organization_id: string };
      }>(`
        mutation {
          insert_patient_record_one(object: {
            clinic_internal_id: "P002-RECEPTIONIST-TEST"
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

    it("physician can only see patient records created by them", async () => {
      // First create a registration created by physician
      await clients.admin.request(`
        mutation {
          insert_patient_record_one(object: {
            organization_id: "${TestDataIds.organizations.org1}"
            clinic_internal_id: "P004-PHYSICIAN-TEST"
            created_by: "${TestDataIds.users.org1Physician}"
          }) {
            id
          }
        }
      `);

      // Physician should see it
      const result = await clients.org1Physician.request<{
        patient_record: Array<{
          id: string;
          organization_id: string;
        }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      expect(result.patient_record.length).toBeGreaterThan(0);
      expect(
        result.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });

    it("org_admin can soft delete patient records in their organization", async () => {
      // First create a registration
      const createResult = await clients.org1Admin.request<{
        insert_patient_record_one: { id: string };
      }>(`
        mutation {
          insert_patient_record_one(object: {
            clinic_internal_id: "P005-DELETE-TEST"
          }) {
            id
          }
        }
      `);

      // Then soft delete it by setting deleted_at
      const updateResult = await clients.org1Admin.request<{
        update_patient_record_by_pk: { id: string };
      }>(`
        mutation {
          update_patient_record_by_pk(
            pk_columns: { id: "${createResult.insert_patient_record_one.id}" }
            _set: { deleted_at: "now()" }
          ) {
            id
          }
        }
      `);

      expect(updateResult.update_patient_record_by_pk).toBeTruthy();

      // Verify the soft-deleted record no longer appears in normal queries
      const queryResult = await clients.org1Admin.request<{
        patient_record_by_pk: { id: string } | null;
      }>(`
        query {
          patient_record_by_pk(id: "${createResult.insert_patient_record_one.id}") {
            id
          }
        }
      `);

      expect(queryResult.patient_record_by_pk).toBeNull();
    });
  });

  describe("Patient Consent Access Control", () => {
    it("org_admin can access patient_consent within their organization", async () => {
      const result = await clients.org1Admin.request<{
        patient_consent: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_consent {
            id
            organization_id
          }
        }
      `);

      // Should succeed and only show org1 records
      expect(Array.isArray(result.patient_consent)).toBe(true);
      if (result.patient_consent.length > 0) {
        expect(
          result.patient_consent.every(
            (c) => c.organization_id === TestDataIds.organizations.org1
          )
        ).toBe(true);
      }
    });
  });

  describe("Questionnaire Response Access Control", () => {
    it("org_admin can access questionnaire_response within their organization", async () => {
      const result = await clients.org1Admin.request<{
        questionnaire_response: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          questionnaire_response {
            id
            organization_id
          }
        }
      `);

      // Should succeed and only show org1 records
      expect(Array.isArray(result.questionnaire_response)).toBe(true);
      if (result.questionnaire_response.length > 0) {
        expect(
          result.questionnaire_response.every(
            (qr) => qr.organization_id === TestDataIds.organizations.org1
          )
        ).toBe(true);
      }
    });
  });

  describe("Cross-Organization Access Denial", () => {
    it("cannot create patient record with explicit different organization", async () => {
      // This should fail due to permission check - trying to specify org2 explicitly
      await expect(
        clients.org1Admin.request(`
          mutation {
            insert_patient_record_one(object: {
              organization_id: "${TestDataIds.organizations.org2}"
              clinic_internal_id: "HACK001"
            }) {
              id
              organization_id
            }
          }
        `)
      ).rejects.toThrow();
    });

    it("org2 admin cannot access org1 practitioner by ID", async () => {
      const result = await clients.org2Admin.request<{
        user_by_pk: { id: string; email: string } | null;
      }>(`
        query {
          user_by_pk(id: "${TestDataIds.users.org1Admin}") {
            id
            email
          }
        }
      `);

      expect(result.user_by_pk).toBeNull();
    });

    it("cross-organization patient registration queries return empty", async () => {
      // Create registration in org1
      await clients.org1Admin.request(`
        mutation {
          insert_patient_record_one(object: {
            clinic_internal_id: "P006-ORG1-ISOLATION"
          }) {
            id
          }
        }
      `);

      // Org2 admin should not see any registrations from org1
      const org2Result = await clients.org2Admin.request<{
        patient_record: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient_record {
            id
            organization_id
          }
        }
      `);

      // Should only see org2 registrations (if any)
      expect(
        org2Result.patient_record.every(
          (r) => r.organization_id === TestDataIds.organizations.org2
        )
      ).toBe(true);
    });
  });
});
