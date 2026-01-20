/**
 * Anamnesis Review Route
 *
 * Dashboard view showing questionnaire overview and scores.
 * First sub-step of the Anamnesis workflow.
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import { execute } from "@/graphql/execute";
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { DashboardView } from "../features/questionnaire-viewer/components/dashboard";

// Use the same query pattern as the layout - this reuses the existing generated types
const GET_PATIENT_RECORD = graphql(`
  query GetPatientRecord($id: String!) {
    patient_record_by_pk(id: $id) {
      id
      clinic_internal_id
      first_name_encrypted
      created_at
      patient_data_completed_at
      viewed
      invite_expires_at
      patient_consent {
        consent_given
      }
      userByLastViewedBy {
        id
        name
        email
      }
    }
  }
`);

export const Route = createFileRoute("/cases_/$id/anamnesis/review")({
  component: AnamnesisReviewPage,
});

function AnamnesisReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);

  // Fetch questionnaire responses
  const { data: responses, isLoading } = useQuestionnaireResponses(id);

  // Fetch patient record (uses TanStack Query cache)
  // Uses the same query key as the layout for cache sharing
  const { data: recordData } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });

  const record = recordData?.patient_record_by_pk;

  // Decrypt patient data for PDF export
  useEffect(() => {
    async function decrypt() {
      if (!record?.first_name_encrypted) return;

      try {
        const privateKeyPem = await loadPrivateKey();
        if (!privateKeyPem) {
          console.warn("No private key found for PDF export");
          return;
        }

        const patientData = await decryptPatientData(record.first_name_encrypted, privateKeyPem);
        setDecryptedData(patientData);
      } catch (error) {
        console.error("Failed to decrypt patient data for export:", error);
      }
    }

    decrypt();
  }, [record?.first_name_encrypted]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Navigate to wizard sub-step
  const handleStartReview = () => {
    navigate({
      to: "/cases/$id/anamnesis/wizard",
      params: { id },
    });
  };

  // Convert PatientPII to DecryptedPatientData format for PDF export
  const patientDataForExport = decryptedData
    ? {
        firstName: decryptedData.firstName,
        lastName: decryptedData.lastName,
        dateOfBirth: decryptedData.dateOfBirth,
        clinicInternalId: record?.clinic_internal_id ?? "",
      }
    : null;

  return (
    <DashboardView
      responses={responses ?? []}
      onStartReview={handleStartReview}
      caseId={id}
      patientData={patientDataForExport}
    />
  );
}
