/**
 * Tests for validation helper functions in auth server
 * Tests the validation functions used by the action handlers
 */

describe("Validation Helper Functions", () => {
  // Since the validation functions are not exported from server.ts,
  // we'll test them indirectly through the endpoints that use them.
  // In a real-world scenario, these would be extracted to a separate module.
  
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

  describe("validateFHIRQuestionnaireResponse function", () => {
    const baseValidResource = {
      resourceType: "QuestionnaireResponse",
      questionnaire: "http://example.com/questionnaire/123",
      status: "completed"
    };

    describe("resourceType validation", () => {
      it("should reject missing resourceType", async () => {
        const invalidResource = { ...baseValidResource };
        delete (invalidResource as any).resourceType;

        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: invalidResource
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("resourceType must be 'QuestionnaireResponse'");
      });

      it("should reject wrong resourceType", async () => {
        const invalidResource = { 
          ...baseValidResource, 
          resourceType: "Patient" 
        };

        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: invalidResource
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("resourceType must be 'QuestionnaireResponse'");
      });

      it("should accept correct resourceType", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: baseValidResource
              }
            }
          })
        });

        const data = await response.json();
        // Should pass resourceType validation (will fail later due to invalid token)
        if (!data.success) {
          expect(data.error).not.toBe("resourceType must be 'QuestionnaireResponse'");
        }
      });
    });

    describe("questionnaire field validation", () => {
      it("should reject missing questionnaire field", async () => {
        const invalidResource = { ...baseValidResource };
        delete (invalidResource as any).questionnaire;

        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: invalidResource
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("questionnaire field is required and must be a string");
      });

      it("should reject non-string questionnaire field", async () => {
        const invalidResource = { 
          ...baseValidResource, 
          questionnaire: 123 
        };

        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: invalidResource
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("questionnaire field is required and must be a string");
      });

      it("should accept valid questionnaire URLs", async () => {
        const validQuestionnaires = [
          "http://example.com/questionnaire/123",
          "https://fhir.example.org/Questionnaire/patient-intake",
          "urn:uuid:12345678-1234-4567-8901-123456789012",
          "Questionnaire/123"
        ];

        for (const questionnaire of validQuestionnaires) {
          const validResource = { 
            ...baseValidResource, 
            questionnaire 
          };

          const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: {
                invite_token: "12345678-1234-4567-8901-123456789012",
                response_data: {
                  fhir_resource: validResource
                }
              }
            })
          });

          const data = await response.json();
          // Should pass questionnaire validation (will fail later due to invalid token)
          if (!data.success) {
            expect(data.error).not.toBe("questionnaire field is required and must be a string");
          }
        }
      });
    });

    describe("status field validation", () => {
      it("should reject missing status field", async () => {
        const invalidResource = { ...baseValidResource };
        delete (invalidResource as any).status;

        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: invalidResource
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("status field is required and must be a string");
      });

      it("should reject non-string status field", async () => {
        const invalidResource = { 
          ...baseValidResource, 
          status: 123 
        };

        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: invalidResource
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("status field is required and must be a string");
      });

      it("should accept all valid FHIR status values", async () => {
        const validStatuses = [
          'in-progress', 
          'completed', 
          'amended', 
          'entered-in-error', 
          'stopped'
        ];

        for (const status of validStatuses) {
          const validResource = { 
            ...baseValidResource, 
            status 
          };

          const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: {
                invite_token: "12345678-1234-4567-8901-123456789012",
                response_data: {
                  fhir_resource: validResource
                }
              }
            })
          });

          const data = await response.json();
          // Should pass status validation (will fail later due to invalid token)
          if (!data.success) {
            expect(data.error).not.toContain("status must be one of:");
          }
        }
      });

      it("should reject invalid status values", async () => {
        const invalidStatuses = [
          'pending',
          'draft',
          'final',
          'unknown',
          'cancelled',
          'COMPLETED', // case sensitive
          'complete' // not exact match
        ];

        for (const status of invalidStatuses) {
          const invalidResource = { 
            ...baseValidResource, 
            status 
          };

          const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              input: {
                invite_token: "12345678-1234-4567-8901-123456789012",
                response_data: {
                  fhir_resource: invalidResource
                }
              }
            })
          });

          const data = await response.json();
          expect(data.success).toBe(false);
          expect(data.error).toContain("status must be one of:");
        }

        // Test empty string separately as it triggers different validation
        const emptyStatusResource = { 
          ...baseValidResource, 
          status: '' 
        };

        const emptyStatusResponse = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: emptyStatusResource
              }
            }
          })
        });

        const emptyStatusData = await emptyStatusResponse.json();
        expect(emptyStatusData.success).toBe(false);
        expect(emptyStatusData.error).toBe("status field is required and must be a string");
      });
    });

    describe("FHIR resource object validation", () => {
      it("should reject null fhir_resource", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: null
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("FHIR resource must be an object");
      });

      it("should reject string fhir_resource", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: "not an object"
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("FHIR resource must be an object");
      });

      it("should reject array fhir_resource", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: []
              }
            }
          })
        });

        const data = await response.json();
        expect(data.success).toBe(false);
        // Arrays in JavaScript are objects, so they pass the typeof check but fail resourceType validation
        expect(data.error).toBe("resourceType must be 'QuestionnaireResponse'");
      });

      it("should accept valid FHIR object structure", async () => {
        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: baseValidResource
              }
            }
          })
        });

        const data = await response.json();
        // Should pass FHIR validation (will fail later due to invalid token)
        if (!data.success) {
          expect(data.error).not.toBe("FHIR resource must be an object");
          expect(data.error).not.toContain("resourceType must be");
          expect(data.error).not.toContain("questionnaire field");
          expect(data.error).not.toContain("status");
        }
      });
    });

    describe("Complex FHIR objects", () => {
      it("should accept complex valid FHIR QuestionnaireResponse", async () => {
        const complexValidResource = {
          resourceType: "QuestionnaireResponse",
          id: "response-123",
          questionnaire: "http://example.com/questionnaire/intake",
          status: "completed",
          authored: "2023-10-01T10:00:00Z",
          subject: {
            reference: "Patient/123",
            display: "John Doe"
          },
          author: {
            reference: "Patient/123"
          },
          item: [
            {
              linkId: "1",
              text: "Chief complaint",
              answer: [{
                valueString: "Headache"
              }]
            },
            {
              linkId: "2", 
              text: "Pain scale",
              answer: [{
                valueInteger: 7
              }]
            },
            {
              linkId: "3",
              text: "Medical history",
              item: [
                {
                  linkId: "3.1",
                  text: "Previous surgeries",
                  answer: [{
                    valueBoolean: false
                  }]
                }
              ]
            }
          ]
        };

        const response = await fetch(`${AUTH_SERVER_URL}/actions/submit-questionnaire-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: {
              invite_token: "12345678-1234-4567-8901-123456789012",
              response_data: {
                fhir_resource: complexValidResource
              }
            }
          })
        });

        const data = await response.json();
        // Should pass all FHIR validation (will fail later due to invalid token)
        if (!data.success) {
          expect(data.error).not.toContain("FHIR resource");
          expect(data.error).not.toContain("resourceType");
          expect(data.error).not.toContain("questionnaire");
          expect(data.error).not.toContain("status");
        }
      });
    });
  });
});