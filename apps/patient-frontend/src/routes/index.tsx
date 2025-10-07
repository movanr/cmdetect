import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { execute } from "../graphql/execute";
import {
  validateInviteToken,
  submitPatientConsent,
  submitPatientPersonalData,
  submitQuestionnaireResponse,
} from "../queries/queries";
import { encryptPatientData } from "../crypto";
import { Button } from "../components/ui/button";

interface PatientSearch {
  token?: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): PatientSearch => {
    return {
      token: search.token as string,
    };
  },
  component: PatientFlowPage,
});

type FlowStep = "validate" | "consent" | "personal-data" | "questionnaire" | "complete" | "declined";

function PatientFlowPage() {
  const { token } = Route.useSearch();

  const [step, setStep] = useState<FlowStep>("validate");
  const [publicKey, setPublicKey] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Validate token mutation
  const validateTokenMutation = useMutation({
    mutationFn: (inviteToken: string) =>
      execute(validateInviteToken, { invite_token: inviteToken }),
    onSuccess: (data) => {
      if (data.validateInviteToken.valid && data.validateInviteToken.public_key_pem) {
        setPublicKey(data.validateInviteToken.public_key_pem);
        setOrganizationName(data.validateInviteToken.organization_name || "");
        setStep("consent");
        setError("");
      } else {
        setError(data.validateInviteToken.error_message || "Invalid invite token");
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to validate token");
    },
  });

  // Consent mutation
  const consentMutation = useMutation({
    mutationFn: (consentData: any) =>
      execute(submitPatientConsent, consentData),
    onSuccess: (data) => {
      if (data.submitPatientConsent.success) {
        setStep("personal-data");
        setError("");
      } else {
        setError(data.submitPatientConsent.error || "Failed to submit consent");
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to submit consent");
    },
  });

  // Personal data mutation
  const personalDataMutation = useMutation({
    mutationFn: async (formData: { firstName: string; lastName: string; dateOfBirth: string }) => {
      // Encrypt patient data
      const encryptedPayload = await encryptPatientData(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
        },
        publicKey
      );

      return execute(submitPatientPersonalData, {
        invite_token: token!,
        patient_data: {
          first_name_encrypted: encryptedPayload,
          last_name_encrypted: encryptedPayload,
          date_of_birth_encrypted: encryptedPayload,
        },
      });
    },
    onSuccess: (data) => {
      if (data.submitPatientPersonalData.success) {
        setStep("questionnaire");
        setError("");
      } else {
        setError(data.submitPatientPersonalData.error || "Failed to submit personal data");
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to submit personal data");
    },
  });

  // Questionnaire mutation
  const questionnaireMutation = useMutation({
    mutationFn: (responseData: any) =>
      execute(submitQuestionnaireResponse, responseData),
    onSuccess: (data) => {
      if (data.submitQuestionnaireResponse.success) {
        setStep("complete");
        setError("");
      } else {
        setError(data.submitQuestionnaireResponse.error || "Failed to submit questionnaire");
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to submit questionnaire");
    },
  });

  // Validate token on mount
  useEffect(() => {
    if (token && step === "validate") {
      validateTokenMutation.mutate(token);
    }
  }, [token]);

  // Handle consent submission
  const handleConsent = async (consentGiven: boolean) => {
    if (!token) return;

    await consentMutation.mutateAsync({
      invite_token: token,
      consent_data: {
        consent_given: consentGiven,
        consent_text: "I consent to the collection and processing of my personal health information.",
        consent_version: "1.0",
      },
    });

    // If consent was declined, move to a special "declined" step
    if (!consentGiven) {
      setStep("declined");
    }
  };

  // Handle personal data submission
  const handlePersonalData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await personalDataMutation.mutateAsync({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
    });
  };

  // Handle questionnaire submission
  const handleQuestionnaire = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.currentTarget);

    await questionnaireMutation.mutateAsync({
      invite_token: token,
      response_data: {
        fhir_resource: {
          resourceType: "QuestionnaireResponse",
          questionnaire: "sample-health-questionnaire-v1",
          status: "completed",
          item: [
            {
              linkId: "1",
              text: "General health assessment",
              answer: [{ valueString: formData.get("answer1") as string }],
            },
          ],
        },
      },
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Access</h1>
          <p className="text-gray-700">
            No invite token provided. Please use the link provided by your healthcare provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-2">Patient Information Form</h1>
          {organizationName && (
            <p className="text-gray-600 mb-6">Organization: {organizationName}</p>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Validate Step */}
          {step === "validate" && !error && (
            <div className="text-center py-8">
              <p className="text-gray-600">Validating your invite token...</p>
            </div>
          )}

          {/* Consent Step */}
          {step === "consent" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 1: Consent</h2>
              <div className="bg-gray-50 p-4 rounded mb-6">
                <p className="text-sm text-gray-700 mb-4">
                  Before proceeding, please review and provide your consent:
                </p>
                <p className="text-sm text-gray-800 font-medium">
                  "I consent to the collection and processing of my personal health information
                  for the purpose of receiving healthcare services. I understand that my information
                  will be encrypted and securely stored."
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleConsent(true)}
                  disabled={consentMutation.isPending}
                  className="flex-1"
                >
                  {consentMutation.isPending ? "Submitting..." : "I Consent"}
                </Button>
                <Button
                  onClick={() => handleConsent(false)}
                  disabled={consentMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {/* Personal Data Step */}
          {step === "personal-data" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 2: Personal Information</h2>
              <form onSubmit={handlePersonalData} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={personalDataMutation.isPending}
                  className="w-full"
                >
                  {personalDataMutation.isPending ? "Encrypting and Submitting..." : "Continue"}
                </Button>
              </form>
            </div>
          )}

          {/* Questionnaire Step */}
          {step === "questionnaire" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 3: Health Questionnaire</h2>
              <form onSubmit={handleQuestionnaire} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    How would you rate your overall health?
                  </label>
                  <textarea
                    name="answer1"
                    required
                    rows={4}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Please describe your current health status..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={questionnaireMutation.isPending}
                  className="w-full"
                >
                  {questionnaireMutation.isPending ? "Submitting..." : "Submit Questionnaire"}
                </Button>
              </form>
            </div>
          )}

          {/* Declined Step */}
          {step === "declined" && (
            <div className="text-center py-8">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-amber-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-amber-700 mb-4">Consent Declined</h2>
              <p className="text-gray-600 mb-6">
                You have declined consent for the collection and processing of your personal health information.
              </p>
              <p className="text-gray-600 mb-6">
                Without consent, we cannot proceed with the patient questionnaire.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If you change your mind, you can return to this page using the same link and provide your consent.
              </p>
              <Button onClick={() => setStep("consent")} variant="outline">
                Return to Consent Form
              </Button>
            </div>
          )}

          {/* Complete Step */}
          {step === "complete" && (
            <div className="text-center py-8">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-2">Complete!</h2>
              <p className="text-gray-600">
                Thank you for completing the patient information form. Your healthcare provider
                will review your information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
