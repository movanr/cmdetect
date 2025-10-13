import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "../components/layouts/AppLayout";
import { KeySetupGuard } from "../features/key-setup/components/KeySetupGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";
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

export const Route = createFileRoute("/cases_/$id")({
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { id } = Route.useParams();
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
      console.log("Updating viewed for record:", record.id);
      updateViewedMutation.mutate({
        id: record.id,
      });
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

  const handleClose = () => {
    navigate({ to: "/cases" });
  };

  if (isLoading) {
    return (
      <KeySetupGuard>
        <AppLayout>
          <div className="space-y-6">
            <div className="text-center">{t.common.loading}</div>
          </div>
        </AppLayout>
      </KeySetupGuard>
    );
  }

  if (!record) {
    return (
      <KeySetupGuard>
        <AppLayout>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Fall nicht gefunden
              </p>
              <div className="flex justify-center mt-4">
                <Button onClick={handleClose}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zur Übersicht
                </Button>
              </div>
            </CardContent>
          </Card>
        </AppLayout>
      </KeySetupGuard>
    );
  }

  const patientName =
    decryptedData && !isDecrypting
      ? `${decryptedData.firstName} ${decryptedData.lastName}`
      : isDecrypting
        ? t.loadingStates.decrypting
        : t.commonValues.encrypted;

  const patientDob = decryptedData?.dateOfBirth
    ? formatDate(new Date(decryptedData.dateOfBirth))
    : null;

  return (
    <KeySetupGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Header with navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <span className="font-semibold">{patientName}</span>
                {patientDob && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Geburtsdatum: {patientDob}
                  </p>
                )}
                {record.clinic_internal_id && (
                  <p className="text-sm text-muted-foreground">
                    ID: {record.clinic_internal_id}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Schließen
            </Button>
          </div>

          {/* Placeholder content */}
          <Card>
            <CardHeader>
              <CardTitle>Falldetails</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hier werden die Falldetails angezeigt.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </KeySetupGuard>
  );
}
