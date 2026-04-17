/**
 * Documentation > Report Sub-Route — DC/TMD-Befundbericht
 *
 * Print-optimized clinical findings report rendered inside
 * the Documentation layout (CaseLayout + SubStepTabs).
 *
 * Route: /cases/:id/documentation/report
 * Parent: cases_.$id.documentation.tsx (provides CaseLayout + SubStepTabs)
 */

import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatManualScoreLine, QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { execute } from "@/graphql/execute";
import { formatDate } from "@/lib/date-utils";
import { useDecryptedPatientData } from "@/hooks/use-decrypted-patient-data";
import { GET_EXAMINATION_RESPONSE, migrateAndParseExaminationData } from "../features/examination";
import { useDocumentedDiagnoses } from "../features/evaluation/hooks/use-diagnosis-evaluation";
import { mapToCriteriaData } from "../features/evaluation/utils/map-to-criteria-data";
import {
  useManualScores,
  useQuestionnaireResponses,
} from "../features/questionnaire-viewer";
import type { FormValues } from "../features/examination";
import { PrintableBefundbericht } from "../features/evaluation/components/PrintableBefundbericht";
import { downloadBefundberichtDocx } from "../features/evaluation/utils/generate-befundbericht-docx";
import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrintTitle, formatFilename } from "@/hooks/use-print-title";
import { GET_PATIENT_RECORD } from "../features/patient-records/queries";

export const Route = createFileRoute("/cases_/$id/documentation/report")({
  component: ReportSubPage,
});

function ReportSubPage() {
  const { id } = Route.useParams();

  // ── Data fetching ──────────────────────────────────────────────────

  const { data: recordData, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });
  const record = recordData?.patient_record_by_pk;

  const { data: responses, isLoading: isResponsesLoading } =
    useQuestionnaireResponses(id);

  // Practitioner-entered manual scores drive Axis 2 in the Befundbericht
  const { data: manualScores, isLoading: isManualScoresLoading } =
    useManualScores(id);

  const { data: examData, isLoading: isExamLoading } = useQuery({
    queryKey: ["examination-response-raw", id],
    queryFn: () => execute(GET_EXAMINATION_RESPONSE, { patient_record_id: id }),
  });

  const { data: evalData, isLoading: isEvalLoading } = useDocumentedDiagnoses(id);

  const { decryptedData, isDecrypting } = useDecryptedPatientData(record?.first_name_encrypted, {
    isDemo: record?.is_demo ?? false,
    clinicInternalId: record?.clinic_internal_id,
  });

  // ── Derive data ────────────────────────────────────────────────────

  const patientName = decryptedData
    ? `${decryptedData.firstName} ${decryptedData.lastName}`
    : undefined;

  const patientDob = decryptedData?.dateOfBirth
    ? formatDate(new Date(decryptedData.dateOfBirth))
    : undefined;

  // Parse examination data
  const examResponse = examData?.examination_response?.[0];
  const responseData = examResponse?.response_data;
  const examinationData = useMemo((): FormValues => {
    if (!responseData) return {} as FormValues;
    const validated = migrateAndParseExaminationData(responseData);
    return (validated ?? {}) as FormValues;
  }, [responseData]);

  // Extract completed sections for section-by-section report
  const completedSections = useMemo((): string[] => {
    const raw = examResponse?.completed_sections;
    return Array.isArray(raw) ? raw : [];
  }, [examResponse]);

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

  // All rows in documented_diagnosis are confirmed — row existence = documented
  const confirmedDiagnoses = useMemo(() => {
    if (!evalData) return [];

    return evalData.map((r) => ({
      diagnosisId: r.diagnosisId,
      side: r.side,
      region: r.region,
      site: r.site,
    }));
  }, [evalData]);

  // Axis 2 section content for the Befundbericht: practitioner-entered manual
  // scores + German interpretation, plus any clinical note. Instruments with no
  // manual entry are omitted (keeps the clinical document concise).
  const questionnaireScores = useMemo(() => {
    if (!manualScores) return [];
    const instruments: ReadonlyArray<{ id: string; label: string }> = [
      { id: QUESTIONNAIRE_ID.GCPS_1M, label: "GCPS-1M" },
      { id: QUESTIONNAIRE_ID.PHQ4, label: "PHQ-4" },
      { id: QUESTIONNAIRE_ID.JFLS8, label: "JFLS-8" },
      { id: QUESTIONNAIRE_ID.JFLS20, label: "JFLS-20" },
      { id: QUESTIONNAIRE_ID.OBC, label: "OBC" },
    ];
    const out: { instrument: string; score: string; note?: string }[] = [];
    for (const { id: qid, label } of instruments) {
      const manual = manualScores[qid];
      const line = formatManualScoreLine(qid, manual?.scores);
      if (!line) continue;
      out.push({
        instrument: label,
        score: line,
        note: manual?.note?.trim() || undefined,
      });
    }
    return out;
  }, [manualScores]);

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
    !isManualScoresLoading &&
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

  // ── DOCX download handler ────────────────────────────────────────

  const handleDocxDownload = () => {
    const filename = patientName
      ? formatFilename("Befundbericht", patientName, examinationDate ?? formatDate(new Date()))
      : formatFilename("Befundbericht", record?.clinic_internal_id ?? id);

    downloadBefundberichtDocx(
      {
        patientName,
        patientDob,
        clinicInternalId: record?.clinic_internal_id ?? undefined,
        examinationDate,
        criteriaData,
        confirmedDiagnoses,
        questionnaireScores,
        examinationData,
        completedSections: completedSections as import("@cmdetect/dc-tmd").SectionId[],
      },
      filename,
    );
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      {/* Export buttons — hidden in print */}
      <div className="print:hidden flex justify-end gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDocxDownload}
          className="gap-1.5"
        >
          <FileText className="size-4" />
          DOCX
        </Button>
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
        questionnaireScores={questionnaireScores}
        examinationData={examinationData}
        completedSections={completedSections as import("@cmdetect/dc-tmd").SectionId[]}
      />
    </>
  );
}
