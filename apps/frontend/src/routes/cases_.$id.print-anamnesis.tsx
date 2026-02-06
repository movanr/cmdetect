/**
 * Print Anamnesis Route
 *
 * Dedicated print-optimized page that renders anamnesis data without app chrome.
 * Opens in a new window, auto-triggers window.print() after render.
 *
 * Route: /cases/:id/print-anamnesis
 * Parent: cases_.$id.tsx (gets KeySetupGuard + CaseWorkflowProvider)
 * Does NOT nest under anamnesis.tsx (no CaseLayout sidebar)
 */

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/graphql";
import { execute } from "@/graphql/execute";
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";
import { formatDate } from "@/lib/date-utils";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { PrintableAnamnesis } from "../features/questionnaire-viewer/components/dashboard/PrintableAnamnesis";

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

export const Route = createFileRoute("/cases_/$id/print-anamnesis")({
  component: PrintAnamnesisPage,
});

function PrintAnamnesisPage() {
  const { id } = Route.useParams();
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [hasPrinted, setHasPrinted] = useState(false);

  // Fetch patient record (shares TanStack Query cache with other routes)
  const { data: recordData, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });

  const record = recordData?.patient_record_by_pk;

  // Fetch questionnaire responses (shares cache)
  const { data: responses, isLoading: isResponsesLoading } = useQuestionnaireResponses(id);

  // Decrypt patient data
  useEffect(() => {
    async function decrypt() {
      if (!record?.first_name_encrypted) {
        setIsDecrypting(false);
        return;
      }

      try {
        const privateKeyPem = await loadPrivateKey();
        if (!privateKeyPem) {
          console.warn("No private key found");
          setIsDecrypting(false);
          return;
        }

        const patientData = await decryptPatientData(record.first_name_encrypted, privateKeyPem);
        setDecryptedData(patientData);
      } catch (error) {
        console.error("Failed to decrypt patient data:", error);
      } finally {
        setIsDecrypting(false);
      }
    }

    decrypt();
  }, [record?.first_name_encrypted]);

  // Auto-trigger print after everything is ready
  const isReady = !isRecordLoading && !isResponsesLoading && !isDecrypting && responses;

  useEffect(() => {
    if (!isReady || hasPrinted) return;

    // Small delay for paint to complete
    const timer = setTimeout(() => {
      setHasPrinted(true);
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, [isReady, hasPrinted]);

  // Format patient display data
  const patientName =
    decryptedData
      ? `${decryptedData.firstName} ${decryptedData.lastName}`
      : undefined;

  const patientDob = decryptedData?.dateOfBirth
    ? formatDate(new Date(decryptedData.dateOfBirth))
    : undefined;

  // Loading state
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen print:hidden">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm">Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* On-screen helper — hidden in print */}
      <div className="print:hidden bg-muted/50 border-b px-4 py-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Druckvorschau — verwenden Sie die Druckfunktion Ihres Browsers (Strg+P / Cmd+P)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm font-medium text-primary hover:underline"
          >
            Erneut drucken
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            className="text-sm text-muted-foreground hover:underline"
          >
            Fenster schließen
          </button>
        </div>
      </div>

      <PrintableAnamnesis
        responses={responses}
        patientName={patientName}
        patientDob={patientDob}
        clinicInternalId={record?.clinic_internal_id ?? undefined}
      />
    </>
  );
}
