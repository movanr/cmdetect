import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CaseLayout } from "../components/layouts/CaseLayout";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "../config/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { execute } from "@/graphql/execute";
import { graphql } from "@/graphql";
import { useEffect, useState } from "react";
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";
import { formatDate } from "@/lib/date-utils";

// GraphQL queries
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

const UPDATE_VIEWED = graphql(`
  mutation UpdateViewed($id: String!) {
    update_patient_record_by_pk(
      pk_columns: { id: $id }
      _set: { viewed: true }
    ) {
      id
      viewed
    }
  }
`);

console.log("cases_.$id.anamnesis.tsx file loaded");

export const Route = createFileRoute("/cases_/$id/anamnesis")({
  component: AnamnesisPage,
});

console.log("Route created:", Route);

function AnamnesisPage() {
  console.log("AnamnesisPage rendering");
  const { id } = Route.useParams();
  console.log("Patient ID:", id);
  const navigate = useNavigate();
  const t = getTranslations();
  const queryClient = useQueryClient();
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Fetch patient record
  const { data, isLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });

  console.log("Query state:", { isLoading, hasData: !!data, record: data?.patient_record_by_pk });

  const record = data?.patient_record_by_pk;

  // Update last viewed mutation
  const updateViewedMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => execute(UPDATE_VIEWED, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-record", id] });
      queryClient.invalidateQueries({ queryKey: ["patient-records"] });
    },
  });

  // Update last_viewed on mount
  useEffect(() => {
    if (record?.id && !updateViewedMutation.isPending) {
      updateViewedMutation.mutate({ id: record.id });
    }
  }, [record?.id]);

  // Decrypt patient data
  useEffect(() => {
    async function decrypt() {
      if (!record?.first_name_encrypted) return;

      setIsDecrypting(true);
      try {
        const privateKeyPem = await loadPrivateKey();
        if (!privateKeyPem) {
          console.warn("No private key found");
          return;
        }

        const patientData = await decryptPatientData(
          record.first_name_encrypted,
          privateKeyPem
        );
        setDecryptedData(patientData);
      } catch (error) {
        console.error("Failed to decrypt patient data:", error);
      } finally {
        setIsDecrypting(false);
      }
    }

    decrypt();
  }, [record?.first_name_encrypted]);

  if (isLoading) {
    return (
      <KeySetupGuard>
        <CaseLayout caseId={id} currentStep="anamnesis">
          <div className="text-center">{t.common.loading}</div>
        </CaseLayout>
      </KeySetupGuard>
    );
  }

  if (!record) {
    return (
      <KeySetupGuard>
        <CaseLayout caseId={id} currentStep="anamnesis">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Fall nicht gefunden
              </p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => navigate({ to: "/cases" })}>
                  Zurück zur Übersicht
                </Button>
              </div>
            </CardContent>
          </Card>
        </CaseLayout>
      </KeySetupGuard>
    );
  }

  const patientName =
    decryptedData && !isDecrypting
      ? `${decryptedData.firstName} ${decryptedData.lastName}`
      : undefined;

  const patientDob = decryptedData?.dateOfBirth
    ? formatDate(new Date(decryptedData.dateOfBirth))
    : undefined;

  return (
    <KeySetupGuard>
      <CaseLayout
        caseId={id}
        patientInternalId={record.clinic_internal_id || undefined}
        currentStep="anamnesis"
        patientName={patientName}
        patientDob={patientDob}
        isDecrypting={isDecrypting}
      >
        {/* Anamnesis Content */}
        <Card>
          <CardHeader>
            <CardTitle>{t.caseSteps.anamnesis}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hier wird der Anamnese-Schritt angezeigt.
            </p>
            {/* TODO: Add anamnesis form/content */}
          </CardContent>
        </Card>
      </CaseLayout>
    </KeySetupGuard>
  );
}
