import { createTestClients } from "../setup/graphql-client";
import { TestDataIds } from "../setup/test-data";

describe("Organization Isolation", () => {
  let clients: Awaited<ReturnType<typeof createTestClients>>;

  beforeEach(async () => {
    clients = await createTestClients();
  });

  describe("Patient Access Control", () => {
    it("org_admin can only access patients from their organization", async () => {
      // Query patients as org1 admin
      const org1Patients = await clients.org1Admin.request<{
        patient: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient {
            id
            organization_id
          }
        }
      `);

      // Verify all patients belong to org1
      expect(org1Patients.patient).toHaveLength(2);
      expect(
        org1Patients.patient.every(
          (p) => p.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);

      // Query patients as org2 admin
      const org2Patients = await clients.org2Admin.request<{
        patient: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient {
            id
            organization_id
          }
        }
      `);

      // Verify all patients belong to org2
      expect(org2Patients.patient).toHaveLength(1);
      expect(
        org2Patients.patient.every(
          (p) => p.organization_id === TestDataIds.organizations.org2
        )
      ).toBe(true);
    });

    it("physician can only access patients from their organization", async () => {
      const org1PhysicianPatients = await clients.org1Physician.request<{
        patient: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient {
            id
            organization_id
          }
        }
      `);

      // Physician should see patients from their org (though permissions may be more restrictive)
      expect(
        org1PhysicianPatients.patient.every(
          (p) => p.organization_id === TestDataIds.organizations.org1
        )
      ).toBe(true);
    });

    it("receptionist can only access patients from their organization", async () => {
      const org1ReceptionistPatients = await clients.org1Receptionist.request<{
        patient: Array<{ id: string; organization_id: string }>;
      }>(`
        query {
          patient {
            id
            organization_id
          }
        }
      `);

      // Receptionist should see patients from their org
      expect(
        org1ReceptionistPatients.patient.every(
          (p) => p.organization_id === TestDataIds.organizations.org1
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

  describe("Patient Record Access Control", () => {
    it("org_admin can create records in their organization", async () => {
      const result = await clients.org1Admin.request<{
        insert_patient_record_one: {
          id: string;
          organization_id: string;
          patient_id: string;
        };
      }>(`
        mutation {
          insert_patient_record_one(object: {
            patient_id: "${TestDataIds.patients.org1Patient1}"
            assigned_to: "${TestDataIds.users.org1PhysicianAppUuid}"
            notes: "Test record"
          }) {
            id
            organization_id
            patient_id
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
            patient_id: "${TestDataIds.patients.org1Patient2}"
            assigned_to: "${TestDataIds.users.org1PhysicianAppUuid}"
            notes: "Receptionist created registration"
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

    it("cannot create registration with cross-organization patient", async () => {
      // Try to create registration for org2 patient as org1 admin
      await expect(
        clients.org1Admin.request(`
          mutation {
            insert_patient_record_one(object: {
              patient_id: "${TestDataIds.patients.org2Patient1}"
              assigned_to: "${TestDataIds.users.org1PhysicianAppUuid}"
              notes: "Cross-org attempt"
            }) {
              id
            }
          }
        `)
      ).rejects.toThrow();
    });

    it("cannot create registration with cross-organization practitioner", async () => {
      // Try to assign org2 practitioner to org1 patient
      await expect(
        clients.org1Admin.request(`
          mutation {
            insert_patient_record_one(object: {
              patient_id: "${TestDataIds.patients.org1Patient1}"
              assigned_to: "${TestDataIds.users.org2PhysicianAppUuid}"
              notes: "Cross-org practitioner attempt"
            }) {
              id
            }
          }
        `)
      ).rejects.toThrow();
    });

    it("physician can only see patient records assigned to them or created by them", async () => {
      // First create a registration assigned to physician
      await clients.admin.request(`
        mutation {
          insert_patient_record_one(object: {
            organization_id: "${TestDataIds.organizations.org1}"
            patient_id: "${TestDataIds.patients.org1Patient1}"
            assigned_to: "${TestDataIds.users.org1PhysicianAppUuid}"
            created_by: "${TestDataIds.users.org1AdminAppUuid}"
            notes: "Assigned to physician"
          }) {
            id
          }
        }
      `);

      // Physician should see it
      const result = await clients.org1Physician.request<{
        patient_record: Array<{
          id: string;
          assigned_to: string;
          organization_id: string;
        }>;
      }>(`
        query {
          patient_record {
            id
            assigned_to
            organization_id
          }
        }
      `);

      expect(result.patient_record.length).toBeGreaterThan(0);
      expect(
        result.patient_record.every(
          (r) =>
            r.organization_id === TestDataIds.organizations.org1 &&
            r.assigned_to === TestDataIds.users.org1PhysicianAppUuid
        )
      ).toBe(true);
    });

    it("org_admin can soft delete registrations in their organization", async () => {
      // First create a registration
      const createResult = await clients.org1Admin.request<{
        insert_patient_record_one: { id: string };
      }>(`
        mutation {
          insert_patient_record_one(object: {
            patient_id: "${TestDataIds.patients.org1Patient1}"
            assigned_to: "${TestDataIds.users.org1PhysicianAppUuid}"
            notes: "To be soft deleted"
          }) {
            id
          }
        }
      `);

      // Then soft delete it by setting deleted_at
      const updateResult = await clients.org1Admin.request<{
        update_patient_record_by_pk: { id: string; deleted_at: string };
      }>(`
        mutation {
          update_patient_record_by_pk(
            pk_columns: { id: "${createResult.insert_patient_record_one.id}" }
            _set: { deleted_at: "now()" }
          ) {
            id
            deleted_at
          }
        }
      `);

      expect(updateResult.update_patient_record_by_pk).toBeTruthy();
      expect(
        updateResult.update_patient_record_by_pk.deleted_at
      ).not.toBeNull();

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
    it("org1 admin cannot access org2 patient by ID", async () => {
      // Try to access org2 patient with org1 admin credentials
      const result = await clients.org1Admin.request<{
        patient_by_pk: { id: string; organization_id: string } | null;
      }>(`
        query {
          patient_by_pk(id: "${TestDataIds.patients.org2Patient1}") {
            id
            organization_id
          }
        }
      `);

      // Should return null due to permission restrictions
      expect(result.patient_by_pk).toBeNull();
    });

    it("cannot insert patient into different organization", async () => {
      // This should fail due to permission check
      await expect(
        clients.org1Admin.request(`
          mutation {
            insert_patient_one(object: {
              organization_id: "${TestDataIds.organizations.org2}"
              clinic_internal_id: "HACK001"
              first_name_encrypted: "encrypted_hacker"
              last_name_encrypted: "encrypted_attempt"
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
            patient_id: "${TestDataIds.patients.org1Patient1}"
            assigned_to: "${TestDataIds.users.org1PhysicianAppUuid}"
            notes: "Org1 registration"
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
