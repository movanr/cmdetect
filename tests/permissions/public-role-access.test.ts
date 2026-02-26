import { GraphQLClient } from "graphql-request";
import { createPublicClient } from "../setup/graphql-client";

describe("Public Role Access Control", () => {
  let publicClient: GraphQLClient;

  beforeEach(() => {
    publicClient = createPublicClient();
  });

  const RESTRICTED_TABLES = [
    "patient_record",
    "organization",
    "patient_consent",
    "questionnaire_response",
    "examination_response",
    "diagnosis_result",
    "user",
  ];

  describe("Restricted tables return schema-level errors", () => {
    // Each test verifies Hasura schema validation fails — the field literally does
    // not exist in the public role's schema, unlike authenticated roles where the
    // field exists but rows are filtered by organization_id.
    for (const table of RESTRICTED_TABLES) {
      it(`public role cannot query ${table}`, async () => {
        await expect(
          publicClient.request(`query { ${table} { id } }`)
        ).rejects.toThrow(/field.*not found in type/i);
      });
    }
  });

  describe("Public actions are accessible in schema", () => {
    // These fail with business/validation errors — not schema errors.
    // This contrasts with restricted tables and confirms the public role
    // has a narrowly defined schema surface (actions only, no raw tables).

    it("validateInviteToken exists in public schema", async () => {
      const err = await publicClient
        .request(`mutation { validateInviteToken(invite_token: "__test__") { valid } }`)
        .catch((e: unknown) => e as { message?: string });
      // Should NOT be a schema-level "field not found" error
      expect(String(err?.message ?? "")).not.toMatch(/field.*not found in type/i);
    });

    it("submitPatientConsent exists in public schema", async () => {
      const err = await publicClient
        .request(`mutation {
          submitPatientConsent(invite_token: "__test__", consent_data: {
            consent_given: true, consent_text: "x", consent_version: "1",
            ip_address: "0.0.0.0", user_agent: "test"
          }) { success }
        }`)
        .catch((e: unknown) => e as { message?: string });
      expect(String(err?.message ?? "")).not.toMatch(/field.*not found in type/i);
    });
  });
});
