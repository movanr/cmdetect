/**
 * Print Examination Route
 *
 * Dedicated print-optimized page that renders examination data without app chrome.
 * Auto-triggers window.print() after render and signals completion to parent iframe.
 *
 * Route: /cases/:id/print-examination
 * Parent: cases_.$id.tsx (gets KeySetupGuard + CaseWorkflowProvider)
 * Does NOT nest under examination.tsx (no CaseLayout sidebar)
 */

import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { execute } from "@/graphql/execute";
import { formatDate } from "@/lib/date-utils";
import { useDecryptedPatientData } from "@/hooks/use-decrypted-patient-data";
import {
  GET_EXAMINATION_RESPONSE,
  examinationFormConfig,
  migrateAndParseExaminationData,
  PrintableExamination,
} from "../features/examination";
import { usePrintTitle, formatFilename } from "@/hooks/use-print-title";
import { GET_PATIENT_RECORD } from "../features/patient-records/queries";

export const Route = createFileRoute("/cases_/$id/print-examination")({
  component: PrintExaminationPage,
});

function PrintExaminationPage() {
  const { id } = Route.useParams();
  const [hasPrinted, setHasPrinted] = useState(false);

  // Fetch patient record
  const { data: recordData, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });

  const record = recordData?.patient_record_by_pk;

  // Fetch examination response
  const { data: examData, isLoading: isExamLoading } = useQuery({
    queryKey: ["examination-response-raw", id],
    queryFn: () => execute(GET_EXAMINATION_RESPONSE, { patient_record_id: id }),
  });

  // Parse examination data — react-hook-form's `values` handles hydration reactively
  const examResponseData = examData?.examination_response?.[0]?.response_data;
  const parsedExamData = useMemo(() => {
    if (!examResponseData) return undefined;
    return migrateAndParseExaminationData(examResponseData) ?? undefined;
  }, [examResponseData]);

  // Create examination form (provides FormContext to E*Summary components)
  const form = useForm({
    ...examinationFormConfig,
    values: parsedExamData,
  });

  const { decryptedData, isDecrypting } = useDecryptedPatientData(record?.first_name_encrypted);

  // Auto-trigger print after everything is ready
  const isReady = !isRecordLoading && !isExamLoading && !isDecrypting;

  useEffect(() => {
    if (!isReady || hasPrinted) return;

    const timer = setTimeout(() => {
      setHasPrinted(true);
      window.addEventListener(
        "afterprint",
        () => {
          window.parent.postMessage({ type: "print-done" }, window.location.origin);
        },
        { once: true }
      );
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

  // Set PDF filename for browser print dialog
  const pdfTitle = decryptedData
    ? formatFilename(
        "Untersuchung",
        decryptedData.firstName,
        decryptedData.lastName,
        formatDate(new Date())
      )
    : formatFilename("Untersuchung", record?.clinic_internal_id ?? id);

  usePrintTitle(pdfTitle);

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
    <FormProvider {...form}>
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

      <PrintableExamination
        patientName={patientName}
        patientDob={patientDob}
        clinicInternalId={record?.clinic_internal_id ?? undefined}
      />
    </FormProvider>
  );
}
