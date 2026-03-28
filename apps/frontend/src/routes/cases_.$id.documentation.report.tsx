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
import {
  calculateGCPS1MScore,
  calculateJFLS8Score,
  calculateJFLS20Score,
  calculateOBCScore,
  calculatePHQ4Score,
  JFLS20_SUBSCALE_LABELS,
  QUESTIONNAIRE_ID,
  type GCPS1MAnswers,
  type JFLS8Answers,
  type JFLS20Answers,
  type OBCAnswers,
} from "@cmdetect/questionnaires";
import { execute } from "@/graphql/execute";
import { formatDate } from "@/lib/date-utils";
import { useDecryptedPatientData } from "@/hooks/use-decrypted-patient-data";
import { GET_EXAMINATION_RESPONSE, migrateAndParseExaminationData } from "../features/examination";
import { useDocumentedDiagnoses } from "../features/evaluation/hooks/use-diagnosis-evaluation";
import { mapToCriteriaData } from "../features/evaluation/utils/map-to-criteria-data";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
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

  const { data: examData, isLoading: isExamLoading } = useQuery({
    queryKey: ["examination-response-raw", id],
    queryFn: () => execute(GET_EXAMINATION_RESPONSE, { patient_record_id: id }),
  });

  const { data: evalData, isLoading: isEvalLoading } = useDocumentedDiagnoses(id);

  const { decryptedData, isDecrypting } = useDecryptedPatientData(record?.first_name_encrypted);

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

  // Compute questionnaire scores for DOCX Achse 2 section
  const questionnaireScores = useMemo(() => {
    if (!responses) return [];
    const scores: { instrument: string; score: string }[] = [];

    const gcps = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.GCPS_1M);
    if (gcps && Object.keys(gcps.answers).length > 0) {
      const s = calculateGCPS1MScore(gcps.answers as GCPS1MAnswers);
      scores.push({ instrument: "GCS", score: `CSI ${s.cpi}, ${s.totalDisabilityPoints} BP` });
    }

    const phq4 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.PHQ4);
    if (phq4 && Object.keys(phq4.answers).length > 0) {
      const s = calculatePHQ4Score(phq4.answers as Record<string, string>);
      scores.push({ instrument: "PHQ-4", score: `${s.total} / ${s.maxTotal}` });
    }

    const jfls8 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS8);
    if (jfls8 && Object.keys(jfls8.answers).length > 0) {
      const s = calculateJFLS8Score(jfls8.answers as JFLS8Answers);
      scores.push({
        instrument: "JFLS-8",
        score:
          s.isValid && s.globalScore !== null
            ? `${s.globalScore.toFixed(2)} / ${s.maxScore}`
            : `Ungültig (${s.missingCount} fehlend)`,
      });
    }

    const jfls20 = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS20);
    if (jfls20 && Object.keys(jfls20.answers).length > 0) {
      const s = calculateJFLS20Score(jfls20.answers as JFLS20Answers);
      let subscaleStr = "";
      if (s.isValid) {
        const parts = (["mastication", "mobility", "communication"] as const)
          .map((k) => {
            const sub = s.subscales[k];
            return sub.isValid && sub.score !== null
              ? `${JFLS20_SUBSCALE_LABELS[k].label} ${sub.score.toFixed(1)}`
              : null;
          })
          .filter(Boolean);
        subscaleStr = parts.length > 0 ? ` (${parts.join(", ")})` : "";
      }
      scores.push({
        instrument: "JFLS-20",
        score:
          s.isValid && s.globalScore !== null
            ? `${s.globalScore.toFixed(2)} / ${s.maxScore}${subscaleStr}`
            : `Ungültig (${s.missingCount} fehlend)`,
      });
    }

    const obc = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.OBC);
    if (obc && Object.keys(obc.answers).length > 0) {
      const s = calculateOBCScore(obc.answers as OBCAnswers);
      scores.push({ instrument: "OBC", score: `${s.totalScore} / ${s.maxScore}` });
    }

    return scores;
  }, [responses]);

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
      />
    </>
  );
}
