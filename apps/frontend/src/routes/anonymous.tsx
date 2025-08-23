import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { signIn, useSession } from "../lib/auth";
import { execute } from "../graphql/execute";
import { getPatientRecordByInvite } from "../queries/submission";

interface AnonymousSearch {
  invite_token?: string;
}

export const Route = createFileRoute("/anonymous")({
  validateSearch: (search: Record<string, unknown>): AnonymousSearch => {
    return {
      invite_token: search.invite_token as string,
    };
  },
  component: AnonymousPage,
});

function AnonymousPage() {
  const { data: session } = useSession();
  const { invite_token } = Route.useSearch();
  const [isCreatingAnonymous, setIsCreatingAnonymous] = useState(false);
  const [patientRecord, setPatientRecord] = useState<any>(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  // Check if this is a patient invite session (has invite_token in URL)
  const isPatientInvite = !!invite_token;

  // Auto-create anonymous session if invite token is present but no session exists
  useEffect(() => {
    if (isPatientInvite && !session?.user && !isCreatingAnonymous) {
      handleCreateAnonymousSession();
    }
  }, [isPatientInvite, session?.user, isCreatingAnonymous]);

  // Fetch patient record when session exists and invite token is present
  useEffect(() => {
    if (isPatientInvite && session?.user && !patientRecord && !isLoadingRecord && !recordError) {
      fetchPatientRecord();
    }
  }, [isPatientInvite, session?.user, patientRecord, isLoadingRecord, recordError]);

  const handleCreateAnonymousSession = async () => {
    setIsCreatingAnonymous(true);
    try {
      const result = await signIn.anonymous();
      console.log("Anonymous session created:", result);
    } catch (error) {
      console.error("Error creating anonymous session:", error);
    } finally {
      setIsCreatingAnonymous(false);
    }
  };

  const fetchPatientRecord = async () => {
    setIsLoadingRecord(true);
    setRecordError(null);
    
    try {
      console.log("Fetching patient record with invite token:", invite_token);
      console.log("Current URL:", window.location.href);
      
      const result = await execute(getPatientRecordByInvite);
      console.log("Patient record result:", result);
      
      if (result.patient_record && result.patient_record.length > 0) {
        setPatientRecord(result.patient_record[0]);
      } else {
        setRecordError("No patient record found with this invite token");
      }
    } catch (error) {
      console.error("Error fetching patient record:", error);
      setRecordError("Failed to load patient record: " + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoadingRecord(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {isPatientInvite ? "Patient Questionnaire" : "Anonymous Access Test"}
      </h1>
      
      {isPatientInvite ? (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-2 text-green-800">Welcome, Patient!</h2>
          <p className="text-gray-700 mb-4">
            You have successfully accessed your anamnesis form using the invite link.
          </p>
          
          <div className="bg-white p-3 rounded border">
            <p className="font-semibold text-gray-800">✅ Authenticated via patient invite</p>
            <p className="text-sm text-gray-600">Session ID: {session?.session?.id || session?.user?.id}</p>
            <p className="text-sm text-gray-600">Invite Token: {invite_token?.substring(0, 8)}...</p>
          </div>

          {isLoadingRecord && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-blue-800 font-medium">Loading patient information...</p>
            </div>
          )}

          {recordError && (
            <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
              <p className="text-red-800 font-medium">❌ {recordError}</p>
            </div>
          )}

          {patientRecord && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-white rounded border">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Record Found</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Record ID:</span>
                    <p className="font-mono text-xs">{patientRecord.id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Patient ID:</span>
                    <p className="font-mono text-xs">{patientRecord.patient_id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Organization ID:</span>
                    <p className="font-mono text-xs">{patientRecord.organization_id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Workflow Status:</span>
                    <p>{patientRecord.workflow_status || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Invite Status:</span>
                    <p>{patientRecord.invite_status || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Created:</span>
                    <p>{patientRecord.created_at ? new Date(patientRecord.created_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Invite Expires:</span>
                    <p>{patientRecord.invite_expires_at ? new Date(patientRecord.invite_expires_at).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Invite Token:</span>
                    <p className="font-mono text-xs">{patientRecord.invite_token}</p>
                  </div>
                </div>
                {patientRecord.notes && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-600">Notes:</span>
                    <p className="mt-1">{patientRecord.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-blue-800 font-medium">✅ Patient record successfully loaded</p>
                <p className="text-sm text-blue-700 mt-1">
                  Your invite token is valid and has been authenticated with the patient record.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Patient Questionnaire Access</h2>
          <p className="text-gray-700 mb-4">
            This simulates how patients would access their anamnesis forms without creating full accounts.
          </p>
          
          {!session ? (
            <button
              onClick={handleCreateAnonymousSession}
              disabled={isCreatingAnonymous}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isCreatingAnonymous ? "Creating Anonymous Session..." : "Start Anonymous Session"}
            </button>
          ) : (
            <div className="bg-green-100 p-3 rounded">
              <p className="font-semibold text-green-800">✅ Anonymous session active</p>
              <p className="text-sm text-green-700">Session ID: {session.session?.id}</p>
              <p className="text-sm text-green-700">User Type: {session.user?.email || 'Anonymous'}</p>
              <p className="text-sm text-green-700 mt-2">
                Anonymous authentication is working! Patients can now access questionnaire forms without creating full accounts.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p><strong>Status:</strong> Anonymous authentication integration complete ✅</p>
        <p className="mt-2">
          {isPatientInvite 
            ? "Patient invite flow working - invite token passed as header to Hasura for validation."
            : "The anonymous role is properly configured and can create JWT tokens with the correct Hasura claims."
          }
        </p>
      </div>
    </div>
  );
}