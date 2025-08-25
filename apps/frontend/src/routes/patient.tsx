import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { execute } from "../graphql/execute";
import { submitPatientConsent, submitQuestionnaireResponse } from "../queries/submission";
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
  const [consentGiven, setConsentGiven] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const sessionCreationAttempted = useRef(false);
  const [consentId, setConsentId] = useState<string | null>(null);
  const [isSubmittingConsent, setIsSubmittingConsent] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);

  // Auto-create anonymous session if not exists
  useEffect(() => {
    if (invite_token && !session?.user && !isCreatingSession && !sessionCreationAttempted.current) {
      sessionCreationAttempted.current = true;
      setIsCreatingSession(true);
      signIn.anonymous().then(() => {
        console.log("Anonymous session created for patient");
      }).catch((error) => {
        console.error("Error creating anonymous session:", error);
        // Don't retry on error to prevent infinite loops
      }).finally(() => {
        setIsCreatingSession(false);
      });
    }
  }, [invite_token, session?.user, isCreatingSession]);

  if (!invite_token) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Invalid Access</h2>
          <p className="text-red-700">No invite token provided. Please use the link provided by your healthcare provider.</p>
        </div>
      </div>
    );
  }

  if (isCreatingSession || !session?.user) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <p className="text-blue-700">Setting up your secure session...</p>
        </div>
      </div>
    );
  }

  const handleSubmitConsent = async () => {
    setIsSubmittingConsent(true);
    setConsentError(null);
    
    try {
      console.log("Submitting consent with token:", invite_token);
      const result = await execute(submitPatientConsent, {
        invite_token,
        consent_data: {
          consent_given: true,
          consent_text: "I agree to participate in this medical questionnaire and consent to the processing of my medical data.",
          consent_version: "1.0",
          ip_address: undefined, // Will be filled by server
          user_agent: undefined, // Will be filled by server
        }
      });

      console.log("Consent submission result:", result);

      if (result.submitPatientConsent.success) {
        setConsentGiven(true);
        setConsentId(result.submitPatientConsent.patient_consent_id);
      } else {
        setConsentError(result.submitPatientConsent.error || "Failed to submit consent");
      }
    } catch (error) {
      console.error("Error submitting consent:", error);
      setConsentError("Failed to submit consent: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmittingConsent(false);
    }
  };

  const handleSubmitQuestionnaire = async (questionnaireData: any) => {
    if (!consentId) return;
    
    setIsSubmittingResponse(true);
    setResponseError(null);
    
    try {
      const result = await execute(submitQuestionnaireResponse, {
        invite_token,
        response_data: {
          fhir_resource: questionnaireData,
          patient_consent_id: consentId
        }
      });

      if (result.submitQuestionnaireResponse.success) {
        setResponses(prev => [...prev, result.submitQuestionnaireResponse.questionnaire_response_id]);
      } else {
        setResponseError(result.submitQuestionnaireResponse.error || "Failed to submit questionnaire response");
      }
    } catch (error) {
      console.error("Error submitting questionnaire response:", error);
      setResponseError("Failed to submit response: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Patient Questionnaire</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Welcome!</h2>
        <p className="text-blue-700 mb-2">
          You have been invited to complete a medical questionnaire. Your responses will be securely stored and reviewed by your healthcare provider.
        </p>
        <p className="text-sm text-blue-600">
          Invite Token: {invite_token.substring(0, 8)}...
        </p>
      </div>

      {!consentGiven ? (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold mb-3 text-yellow-800">Consent Required</h3>
          <p className="text-yellow-700 mb-4">
            Before you can proceed with the questionnaire, we need your consent to process your medical data.
          </p>
          <div className="bg-white p-4 rounded border mb-4">
            <p className="text-sm text-gray-700">
              <strong>Consent Statement:</strong><br/>
              "I agree to participate in this medical questionnaire and consent to the processing of my medical data for healthcare purposes. I understand that my responses will be reviewed by my healthcare provider."
            </p>
          </div>
          
          {consentError && (
            <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
              <p className="text-red-800 font-medium">❌ {consentError}</p>
            </div>
          )}
          
          <button
            onClick={handleSubmitConsent}
            disabled={isSubmittingConsent}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmittingConsent ? "Submitting Consent..." : "I Consent and Agree"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Consent Recorded</h3>
            <p className="text-green-700 text-sm">
              Consent ID: {consentId}
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Sample Questionnaire</h3>
            <p className="text-gray-600 mb-4">
              This is a demonstration. In a real application, this would be a dynamic FHIR questionnaire.
            </p>
            
            {responseError && (
              <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                <p className="text-red-800 font-medium">❌ {responseError}</p>
              </div>
            )}
            
            <button
              onClick={() => handleSubmitQuestionnaire({
                resourceType: "QuestionnaireResponse",
                status: "completed",
                item: [
                  {
                    linkId: "1",
                    text: "Sample question response",
                    answer: [{ valueString: "Sample answer" }]
                  }
                ]
              })}
              disabled={isSubmittingResponse}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmittingResponse ? "Submitting..." : "Submit Sample Response"}
            </button>
          </div>

          {responses.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Submitted Responses</h3>
              <ul className="text-green-700 text-sm">
                {responses.map((responseId, index) => (
                  <li key={responseId}>Response {index + 1}: {responseId}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}