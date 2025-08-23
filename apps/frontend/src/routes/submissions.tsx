import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getOrganizations, getPatientRecords } from "../queries/submission";
import { execute } from "../graphql/execute";
import { useState } from "react";

export const Route = createFileRoute("/submissions")({
  component: Submissions,
});

function Submissions() {
  const [selectedOrgId, setSelectedOrgId] = useState("");

  // Get all organizations (this will be filtered by JWT claims when auth is working)
  const { data: orgsData, isLoading: orgsLoading, error: orgsError } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => execute(getOrganizations),
  });

  // Get patient records for selected organization
  const { data: recordsData, isLoading: recordsLoading, error: recordsError } = useQuery({
    queryKey: ["patient-records", selectedOrgId],
    queryFn: () => execute(getPatientRecords, { organizationId: selectedOrgId }),
    enabled: !!selectedOrgId,
  });

  if (orgsError) return <div>Error loading organizations: {orgsError.message}</div>;
  if (recordsError) return <div>Error loading patient records: {recordsError.message}</div>;

  const organizations = orgsData?.organization || [];
  const patientRecords = recordsData?.patient_record || [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Data Access</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Organizations</h2>
        {orgsLoading ? (
          <div>Loading organizations...</div>
        ) : (
          <div className="space-y-2">
            {organizations.map((org) => (
              <div 
                key={org.id}
                className="border p-3 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedOrgId(org.id)}
                style={{ backgroundColor: selectedOrgId === org.id ? '#e5f3ff' : 'white' }}
              >
                <h3 className="font-semibold">{org.name}</h3>
                <p className="text-sm text-gray-600">City: {org.city}</p>
                <p className="text-xs text-gray-500">ID: {org.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrgId && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Patient Records</h2>
          {recordsLoading ? (
            <div>Loading patient records...</div>
          ) : patientRecords.length === 0 ? (
            <p>No patient records found for this organization</p>
          ) : (
            <div className="space-y-2">
              {patientRecords.map((record) => (
                <div key={record.id} className="border p-3 rounded">
                  <p><strong>Record ID:</strong> {record.id}</p>
                  <p><strong>Workflow Status:</strong> {record.workflow_status}</p>
                  <p><strong>Invite Status:</strong> {record.invite_status}</p>
                  <p><strong>Created:</strong> {new Date(record.created_at).toLocaleString()}</p>
                  {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
