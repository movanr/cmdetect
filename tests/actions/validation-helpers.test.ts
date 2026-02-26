/**
 * Tests for validation helper functions in auth server
 * Tests the validation functions used by the action handlers
 */

describe("Validation Helper Functions", () => {
  // Since the validation functions are not exported from server.ts,
  // we'll test them indirectly through the endpoints that use them.

  const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || "http://localhost:3001";

  describe("validateUUID function (tested via invite_token validation)", () => {
    const testCases = [
      {
        description: "valid UUID v4 lowercase",
        input: "12345678-1234-4567-8901-123456789012",
        expectValid: true
      },
      {
        description: "valid UUID v4 uppercase",
        input: "12345678-1234-4567-8901-123456789ABC",
        expectValid: true
      },
      {
        description: "valid UUID v4 mixed case",
        input: "12345678-1234-4567-8901-123456789aBc",
        expectValid: true
      },
      {
        description: "invalid UUID - too short",
        input: "12345678-1234-4567-8901-12345678901",
        expectValid: false
      },
      {
        description: "invalid UUID - too long",
        input: "12345678-1234-4567-8901-1234567890123",
        expectValid: false
      },
      {
        description: "invalid UUID - missing hyphens",
        input: "12345678123445678901123456789012",
        expectValid: false
      },
      {
        description: "invalid UUID - wrong format",
        input: "12345678_1234_4567_8901_123456789012",
        expectValid: false
      },
      {
        description: "invalid UUID - contains invalid characters",
        input: "12345678-1234-4567-8901-123456789XYZ",
        expectValid: false
      },
      {
        description: "empty string",
        input: "",
        expectValid: false
      },
      {
        description: "null value",
        input: null,
        expectValid: false
      },
      {
        description: "undefined value",
        input: undefined,
        expectValid: false
      },
      {
        description: "non-string value",
        input: 123456,
        expectValid: false
      }
    ];

    testCases.forEach(({ description, input, expectValid }) => {
      it(`should ${expectValid ? 'accept' : 'reject'} ${description}`, async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: input,
              consent_data: {
                consent_given: true,
                consent_text: "Test consent",
                consent_version: "v1.0"
              }
            }
          })
        });

        const data = await response.json();

        if (expectValid) {
          // If UUID is valid, we should get past UUID validation
          // (might fail later due to token not existing, but error should be different)
          if (!data.success) {
            expect(data.error).not.toBe("Invalid invite token format");
          }
        } else {
          // If UUID is invalid, should fail with format error
          expect(data.success).toBe(false);
          expect(data.error).toBe("Invalid invite token format");
        }
      });
    });
  });

  describe("validateInviteToken function (comprehensive testing)", () => {
    it("should reject missing invite_token parameter", async () => {
      const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            consent_data: {
              consent_given: true,
              consent_text: "Test consent",
              consent_version: "v1.0"
            }
          }
        })
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid invite token format");
    });

    it("should provide consistent error message for all invalid formats", async () => {
      const invalidTokens = [
        "",
        null,
        undefined,
        123,
        "not-a-uuid",
        "12345678-1234-4567-8901-12345678901", // too short
        "12345678_1234_4567_8901_123456789012", // wrong separators
      ];

      for (const invalidToken of invalidTokens) {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-patient-consent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: invalidToken,
              consent_data: {
                consent_given: true,
                consent_text: "Test consent",
                consent_version: "v1.0"
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("Invalid invite token format");
      }
    });
  });

  describe("validateQuestionnaireResponseData function", () => {
    describe("response_data structure validation", () => {
      it("should reject missing response_data", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("Invalid response data");
      });

      it("should reject non-object response_data (string)", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: "not-an-object"
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("Invalid response data");
      });

      it("should reject non-object response_data (array)", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: []
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("Invalid response data");
      });

      it("should reject missing questionnaire_id", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                questionnaire_version: "v1.0",
                answers: {}
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        // Not a format error — the UUID was valid, fails on questionnaire_id
        expect(data.error).not.toBe("Invalid invite token format");
        expect(data.error).not.toBe("Invalid response data");
      });

      it("should reject invalid questionnaire_id", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                questionnaire_id: "not-a-valid-questionnaire",
                questionnaire_version: "v1.0",
                answers: {}
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).not.toBe("Invalid invite token format");
        expect(data.error).not.toBe("Invalid response data");
      });
    });
  });
});
