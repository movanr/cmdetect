/**
 * Documentation > Report Sub-Route — DC/TMD-Befundbericht
 *
 * Print-optimized clinical findings report rendered inside
 * the Documentation layout (CaseLayout + SubStepTabs).
 *
 * Route: /cases/:id/documentation/report
 * Parent: cases_.$id.documentation.tsx (provides CaseLayout + SubStepTabs)
 */

import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { graphql } from "@/graphql";
import { execute } from "@/graphql/execute";
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";
import { formatDate } from "@/lib/date-utils";
import { GET_EXAMINATION_RESPONSE } from "../features/examination/queries";
import { migrateAndParseExaminationData } from "../features/examination/hooks/validate-persistence";
import { useDiagnosisEvaluation } from "../features/evaluation/hooks/use-diagnosis-evaluation";
import { mapToCriteriaData } from "../features/evaluation/utils/map-to-criteria-data";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import type { FormValues } from "../features/examination";
import { PrintableBefundbericht } from "../features/evaluation/components/PrintableBefundbericht";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrintTitle, formatFilename } from "@/hooks/use-print-title";

// Reuse the same GetPatientRecord query (must match exact text for codegen)
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

export const Route = createFileRoute("/cases_/$id/documentation/report")({
  component: ReportSubPage,
});

function ReportSubPage() {
  const { id } = Route.useParams();
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(true);

  // ── Data fetching ──────────────────────────────────────────────────

  const { data: recordData, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });
  const record = recordData?.patient_record_by_pk;

  const { data: responses, isLoading: isResponsesLoading } =
    useQuestionnaireResponses(id);

  const { data: examData, isLoading: isExamLoading } = useQuery({
    queryKey: ["examination-response-raw", id],
    queryFn: () => execute(GET_EXAMINATION_RESPONSE, { patient_record_id: id }),
  });

  const { data: evalData, isLoading: isEvalLoading } = useDiagnosisEvaluation(id);

  // ── Decrypt patient data (for print header) ──────────────────────

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

  // ── Derive data ────────────────────────────────────────────────────

  const patientName = decryptedData
    ? `${decryptedData.firstName} ${decryptedData.lastName}`
    : undefined;

  const patientDob = decryptedData?.dateOfBirth
    ? formatDate(new Date(decryptedData.dateOfBirth))
    : undefined;

  // Parse examination data
  const examResponse = examData?.examination_response?.[0];
  const examinationData = useMemo((): FormValues => {
    if (!examResponse?.response_data) return {} as FormValues;
    const validated = migrateAndParseExaminationData(
      examResponse.response_data
    );
    return (validated ?? {}) as FormValues;
  }, [examResponse?.response_data]);

  const examinationDate = examResponse?.completed_at
    ? formatDate(new Date(examResponse.completed_at))
    : undefined;

  // Extract SQ answers from questionnaire responses
  const sqAnswers = useMemo((): Record<string, unknown> => {
    const sqResponse = responses?.find(
      (r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ
    );
    return (sqResponse?.answers ?? {}) as Record<string, unknown>;
  }, [responses]);

  // Build criteria data
  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData]
  );

  // Extract confirmed diagnoses from evaluation
  const confirmedDiagnoses = useMemo(() => {
    if (!evalData) return [];

    return evalData.results
      .filter((r) => r.practitionerDecision === "confirmed")
      .map((r) => ({
        diagnosisId: r.diagnosisId,
        side: r.side,
        region: r.region,
      }));
  }, [evalData]);

  // Set PDF filename for browser print dialog
  const pdfTitle = patientName
    ? formatFilename(
        "Befundbericht",
        patientName,
        examinationDate ?? formatDate(new Date())
      )
    : formatFilename("Befundbericht", record?.clinic_internal_id ?? id);

  usePrintTitle(pdfTitle);

  // ── Loading ────────────────────────────────────────────────────────

  const isReady =
    !isRecordLoading &&
    !isResponsesLoading &&
    !isExamLoading &&
    !isEvalLoading &&
    !isDecrypting;

  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm">
            Befundbericht wird geladen...
          </p>
        </div>
      </div>
    );
  }

  // ── Print handler with render delay ───────────────────────────────

  const handlePrint = () => {
    // Use requestAnimationFrame to ensure content is painted before printing
    // This prevents empty prints on slower connections/remote servers
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 100);
    });
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      {/* Print button — hidden in print */}
      <div className="print:hidden flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5"
        >
          <Printer className="size-4" />
          Drucken / PDF
        </Button>
      </div>

      <PrintableBefundbericht
        patientName={patientName}
        patientDob={patientDob}
        clinicInternalId={record?.clinic_internal_id ?? undefined}
        examinationDate={examinationDate}
        criteriaData={criteriaData}
        confirmedDiagnoses={confirmedDiagnoses}
      />
    </>
  );
}
