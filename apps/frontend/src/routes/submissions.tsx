import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getSubmissions } from "../queries/submission";
import { execute } from "../graphql/execute";
import { useState } from "react";

export const Route = createFileRoute("/submissions")({
  component: Submissions,
});

function Submissions() {
  const [organisationId, setOrganisationId] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["submissions", organisationId],
    queryFn: () => execute(getSubmissions, { organisationId }),
    enabled: !!organisationId,
  });

  if (error) return <div>Error loading submissions: {error.message}</div>;

  const submissions = data?.submission || [];

  return (
    <div>
      <h1>Submissions</h1>
      <div style={{ marginBottom: "20px" }}>
        <label>
          Organisation ID:
          <input
            type="text"
            value={organisationId}
            onChange={(e) => setOrganisationId(e.target.value)}
            placeholder="Enter organisation ID for testing"
            style={{ marginLeft: "8px", padding: "4px" }}
          />
        </label>
      </div>

      {isLoading && <div>Loading submissions...</div>}

      {organisationId && !isLoading && (
        <div>
          {submissions.length === 0 ? (
            <p>No submissions found for organisation ID: {organisationId}</p>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                style={{
                  border: "1px solid #ccc",
                  margin: "8px",
                  padding: "16px",
                }}
              >
                <h3>Submission ID: {submission.id}</h3>
                <p>
                  <strong>Status:</strong> {submission.status}
                </p>
                <h4>
                  Questionnaire Responses (
                  {submission.questionnaire_responses?.length || 0})
                </h4>
                {submission.questionnaire_responses?.map((response, index) => (
                  <div
                    key={index}
                    style={{ marginLeft: "16px", marginBottom: "12px" }}
                  >
                    <h5>Response {index + 1}</h5>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: "8px",
                        overflow: "auto",
                      }}
                    >
                      {JSON.stringify(response.fhir_resource, null, 2)}
                    </pre>
                  </div>
                )) || (
                  <p style={{ marginLeft: "16px" }}>
                    No questionnaire responses
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
