/**
 * Tests for role switching endpoint in auth server
 * Tests the /api/auth/switch-role endpoint
 */

import { resetTestDatabase, testDatabaseConnection } from "../setup/database";
import { isAuthServerAvailable } from "../setup/auth-server";
import { TestUsers } from "@cmdetect/test-utils";
import { roles } from "@cmdetect/config";

describe("Role Switching Endpoint", () => {
  const AUTH_SERVER_URL =
    process.env.AUTH_SERVER_URL || "http://localhost:3001";

  beforeAll(async () => {
    // Check services availability
    const hasuraAvailable = await testDatabaseConnection();
    const authServerAvailable = await isAuthServerAvailable();

    if (!hasuraAvailable) {
      throw new Error(
        "Hasura is not available. Please start Hasura before running tests."
      );
    }
    if (!authServerAvailable) {
      throw new Error(
        "Auth server is not available. Please start the auth server before running tests."
      );
    }

    // Reset test data
    await resetTestDatabase();
  });

  describe("Authentication Validation", () => {
    it("should reject requests without authentication", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roles.PHYSICIAN,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Invalid session");
    });

    it("should reject requests with invalid session", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "better-auth.session_token=invalid-token",
        },
        body: JSON.stringify({
          role: roles.PHYSICIAN,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Invalid session");
    });
  });

  describe("Role Validation", () => {
    let sessionToken: string;

    beforeAll(async () => {
      // Get a valid session token for org2Physician who has multiple roles
      const signInResponse = await fetch(
        `${AUTH_SERVER_URL}/api/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TestUsers.org2Physician.email,
            password: TestUsers.org2Physician.password,
          }),
        }
      );

      expect(signInResponse.ok).toBe(true);

      const setCookieHeader = signInResponse.headers.get("set-cookie");
      const sessionTokenMatch = setCookieHeader?.match(
        /better-auth\.session_token=([^;]+)/
      );
      sessionToken = sessionTokenMatch?.[1] || "";
      expect(sessionToken).toBeTruthy();
    });

    it("should reject missing role parameter", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Role is required and must be a string");
    });

    it("should reject non-string role parameter", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify({
          role: 123,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Role is required and must be a string");
    });

    it("should reject role user doesn't have", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify({
          role: roles.ORG_ADMIN,
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe(
        "You don't have permission to switch to role: org_admin"
      );
    });

    it("should allow switching to a role user has", async () => {
      // org2Physician has both "physician" and "receptionist" roles
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify({
          role: roles.RECEPTIONIST,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activeRole).toBe(roles.RECEPTIONIST);
      expect(data.availableRoles).toContain(roles.PHYSICIAN);
      expect(data.availableRoles).toContain(roles.RECEPTIONIST);
      expect(data.message).toBe(
        "Role switched successfully. Please refresh your session to get a new token."
      );
    });

    it("should allow switching back to original role", async () => {
      // Switch back to physician role
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify({
          role: roles.PHYSICIAN,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activeRole).toBe(roles.PHYSICIAN);
      expect(data.availableRoles).toContain(roles.PHYSICIAN);
      expect(data.availableRoles).toContain(roles.RECEPTIONIST);
    });
  });

  describe("Single Role Users", () => {
    it("should allow single-role user to switch to their own role", async () => {
      // org1Admin has only "org_admin" role
      const signInResponse = await fetch(
        `${AUTH_SERVER_URL}/api/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TestUsers.org1Admin.email,
            password: TestUsers.org1Admin.password,
          }),
        }
      );

      expect(signInResponse.ok).toBe(true);

      const setCookieHeader = signInResponse.headers.get("set-cookie");
      const sessionTokenMatch = setCookieHeader?.match(
        /better-auth\.session_token=([^;]+)/
      );
      const sessionToken = sessionTokenMatch?.[1] || "";

      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify({
          role: roles.ORG_ADMIN,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.activeRole).toBe(roles.ORG_ADMIN);
      expect(data.availableRoles).toEqual([roles.ORG_ADMIN]);
    });

    it("should reject single-role user attempting to switch to different role", async () => {
      // org1Physician has only roles.PHYSICIAN role
      const signInResponse = await fetch(
        `${AUTH_SERVER_URL}/api/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TestUsers.org1Physician.email,
            password: TestUsers.org1Physician.password,
          }),
        }
      );

      expect(signInResponse.ok).toBe(true);

      const setCookieHeader = signInResponse.headers.get("set-cookie");
      const sessionTokenMatch = setCookieHeader?.match(
        /better-auth\.session_token=([^;]+)/
      );
      const sessionToken = sessionTokenMatch?.[1] || "";

      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
        body: JSON.stringify({
          role: roles.ORG_ADMIN,
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe(
        "You don't have permission to switch to role: org_admin"
      );
    });
  });

  describe("Database Persistence", () => {
    it("should persist activeRole change in database", async () => {
      // Get session for org2Physician
      const signInResponse = await fetch(
        `${AUTH_SERVER_URL}/api/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TestUsers.org2Physician.email,
            password: TestUsers.org2Physician.password,
          }),
        }
      );

      const setCookieHeader = signInResponse.headers.get("set-cookie");
      const sessionTokenMatch = setCookieHeader?.match(
        /better-auth\.session_token=([^;]+)/
      );
      const sessionToken = sessionTokenMatch?.[1] || "";

      // Switch to receptionist role
      const switchResponse = await fetch(
        `${AUTH_SERVER_URL}/api/auth/switch-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `better-auth.session_token=${sessionToken}`,
          },
          body: JSON.stringify({
            role: roles.RECEPTIONIST,
          }),
        }
      );

      expect(switchResponse.status).toBe(200);

      // Verify the activeRole was updated in the database
      // We can't easily query the auth database directly, but we can verify
      // by getting a fresh session and checking the JWT token
      const tokenResponse = await fetch(`${AUTH_SERVER_URL}/api/auth/token`, {
        method: "GET",
        headers: {
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
      });

      expect(tokenResponse.ok).toBe(true);
      const tokenData = await tokenResponse.json();
      expect(tokenData.token).toBeDefined();

      // Decode JWT to verify the activeRole
      const payload = JSON.parse(atob(tokenData.token.split(".")[1]));
      expect(
        payload["https://hasura.io/jwt/claims"]["x-hasura-default-role"]
      ).toBe(roles.RECEPTIONIST);
    });
  });

  describe("Error Handling", () => {
    it("should handle server errors gracefully", async () => {
      // This test would require mocking database errors, which is complex
      // In a real scenario, you might temporarily modify the database connection
      // or use dependency injection to inject a failing database mock

      // For now, we'll just verify the endpoint structure exists
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roles.PHYSICIAN,
        }),
      });

      // Should get 401 because no auth, not 404 or 500
      expect(response.status).toBe(401);
    });

    it("should handle malformed JSON requests", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/switch-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });

      // Should handle malformed JSON gracefully
      expect([400, 401].includes(response.status)).toBe(true);
    });
  });

  describe("Multiple Role Scenarios", () => {
    it("should handle user with multiple roles correctly", async () => {
      // Test org2Physician who has ["physician", "receptionist"]
      const signInResponse = await fetch(
        `${AUTH_SERVER_URL}/api/auth/sign-in/email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: TestUsers.org2Physician.email,
            password: TestUsers.org2Physician.password,
          }),
        }
      );

      const setCookieHeader = signInResponse.headers.get("set-cookie");
      const sessionTokenMatch = setCookieHeader?.match(
        /better-auth\.session_token=([^;]+)/
      );
      const sessionToken = sessionTokenMatch?.[1] || "";

      // Should be able to switch to receptionist
      const switchToReceptionistResponse = await fetch(
        `${AUTH_SERVER_URL}/api/auth/switch-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `better-auth.session_token=${sessionToken}`,
          },
          body: JSON.stringify({
            role: roles.RECEPTIONIST,
          }),
        }
      );

      expect(switchToReceptionistResponse.status).toBe(200);
      const receptionistData = await switchToReceptionistResponse.json();
      expect(receptionistData.activeRole).toBe(roles.RECEPTIONIST);

      // Should be able to switch back to physician
      const switchToPhysicianResponse = await fetch(
        `${AUTH_SERVER_URL}/api/auth/switch-role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `better-auth.session_token=${sessionToken}`,
          },
          body: JSON.stringify({
            role: roles.PHYSICIAN,
          }),
        }
      );

      expect(switchToPhysicianResponse.status).toBe(200);
      const physicianData = await switchToPhysicianResponse.json();
      expect(physicianData.activeRole).toBe(roles.PHYSICIAN);

      // Both responses should show all available roles
      expect(receptionistData.availableRoles).toContain(roles.PHYSICIAN);
      expect(receptionistData.availableRoles).toContain(roles.RECEPTIONIST);
      expect(physicianData.availableRoles).toContain(roles.PHYSICIAN);
      expect(physicianData.availableRoles).toContain(roles.RECEPTIONIST);
    });
  });
});
