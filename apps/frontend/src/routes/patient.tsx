import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "../graphql/execute";
import {
  submitPatientConsent,
  submitQuestionnaireResponse,
} from "../queries/submission";
import { signIn, useSession } from "../lib/auth";

interface PatientSearch {
  invite_token?: string;
}

export const Route = createFileRoute("/patient")({
  validateSearch: (search: Record<string, unknown>): PatientSearch => {
    return {
      invite_token: search.invite_token as string,
    };
  },
  component: PatientPage,
});

function PatientPage() {
  const { data: session } = useSession();
  const { invite_token } = Route.useSearch();

  // Simple state for session creation
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const sessionCreationAttempted = useRef(false);
  const [responses, setResponses] = useState<string[]>([]);

  // Auto-create anonymous session if not exists (simple, no complex dependencies)
  useEffect(() => {
    if (
      invite_token &&
      !session?.user &&
      !isCreatingSession &&
      !sessionCreationAttempted.current
    ) {
      sessionCreationAttempted.current = true;
      setIsCreatingSession(true);

      signIn
        .anonymous()
        .then(() => console.log("Anonymous session created for patient"))
        .catch((error) =>
          console.error("Error creating anonymous session:", error)
        )
        .finally(() => setIsCreatingSession(false));
    }
  }, [invite_token, session?.user, isCreatingSession]);

  // State to track if consent was submitted in this session
  const [consentSubmitted, setConsentSubmitted] = useState(false);

  // Consent submission mutation
  const submitConsentMutation = useMutation({
    mutationFn: (consentData: any) =>
      execute(submitPatientConsent, consentData),
    onSuccess: (data) => {
      if (data.submitPatientConsent.success) {
        setConsentSubmitted(true);
      }
    },
  });

  // Questionnaire response mutation
  const submitResponseMutation = useMutation({
    mutationFn: (responseData: any) =>
      execute(submitQuestionnaireResponse, responseData),
    onSuccess: (data) => {
      if (data.submitQuestionnaireResponse.success) {
        setResponses((prev) => [
          ...prev,
          data.submitQuestionnaireResponse.questionnaire_response_id,
        ]);
      }
    },
  });

  // Handler functions
  const handleSubmitConsent = async () => {
    if (!invite_token) return;

    await submitConsentMutation.mutateAsync({
      invite_token,
      consent_data: {
        consent_given: true,
        consent_text:
          "I agree to participate in this medical questionnaire and consent to the processing of my medical data.",
        consent_version: "1.0",
        ip_address: undefined, // Will be filled by server
        user_agent: undefined, // Will be filled by server
      },
    });
  };

  const handleSubmitQuestionnaire = async (questionnaireData: any) => {
    if (!invite_token) return;

    await submitResponseMutation.mutateAsync({
      invite_token,
      response_data: {
        fhir_resource: questionnaireData,
      },
    });
  };

  if (!invite_token) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Invalid Access
          </h2>
          <p className="text-red-700">
            No invite token provided. Please use the link provided by your
            healthcare provider.
          </p>
        </div>
      </div>
    );
  }

  // Show loading states
  if (isCreatingSession || !session?.user) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-blue-700">Setting up your secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Patient Questionnaire</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Welcome!</h2>
        <p className="text-blue-700 mb-2">
          You have been invited to complete a medical questionnaire. Your
          responses will be securely stored and reviewed by your healthcare
          provider.
        </p>
        <p className="text-sm text-blue-600">
          Invite Token: {invite_token.substring(0, 8)}...
        </p>
      </div>

      {!consentSubmitted ? (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold mb-3 text-yellow-800">
            Consent Required
          </h3>
          <p className="text-yellow-700 mb-4">
            Before you can proceed with the questionnaire, we need your consent
            to process your medical data.
          </p>
          <div className="bg-white p-4 rounded border mb-4">
            <p className="text-sm text-gray-700">
              <strong>Consent Statement:</strong>
              <br />
              "I agree to participate in this medical questionnaire and consent
              to the processing of my medical data for healthcare purposes. I
              understand that my responses will be reviewed by my healthcare
              provider."
            </p>
          </div>

          {submitConsentMutation.error && (
            <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
              <p className="text-red-800 font-medium">
                ❌{" "}
                {submitConsentMutation.error instanceof Error
                  ? submitConsentMutation.error.message
                  : "Failed to submit consent"}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmitConsent}
            disabled={submitConsentMutation.isPending}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {submitConsentMutation.isPending
              ? "Submitting Consent..."
              : "I Consent and Agree"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Consent Recorded
            </h3>
            <p className="text-green-700 text-sm">
              Consent submitted successfully
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Sample Questionnaire</h3>
            <p className="text-gray-600 mb-4">
              This is a demonstration. In a real application, this would be a
              dynamic FHIR questionnaire.
            </p>

            {submitResponseMutation.error && (
              <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                <p className="text-red-800 font-medium">
                  ❌{" "}
                  {submitResponseMutation.error instanceof Error
                    ? submitResponseMutation.error.message
                    : "Failed to submit response"}
                </p>
              </div>
            )}

            <button
              onClick={() =>
                handleSubmitQuestionnaire({
                  resourceType: "QuestionnaireResponse",
                  questionnaire: "sample-questionnaire-v1.0",
                  status: "completed",
                  item: [
                    {
                      linkId: "1",
                      text: "Sample question response",
                      answer: [{ valueString: "Sample answer" }],
                    },
                  ],
                })
              }
              disabled={submitResponseMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitResponseMutation.isPending
                ? "Submitting..."
                : "Submit Sample Response"}
            </button>
          </div>

          {responses.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Submitted Responses
              </h3>
              <ul className="text-green-700 text-sm">
                {responses.map((responseId, index) => (
                  <li key={responseId}>
                    Response {index + 1}: {responseId}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
