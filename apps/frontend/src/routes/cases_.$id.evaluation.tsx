/**
 * Evaluation Route
 *
 * Displays DC/TMD diagnosis evaluation results for a case.
 * Fetches SQ questionnaire answers and examination data,
 * then evaluates all diagnoses and displays results.
 */

import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { CaseLayout } from "../components/layouts/CaseLayout";
import { formatDate } from "@/lib/date-utils";
import { useSession } from "@/lib/auth";
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";
import { graphql } from "@/graphql";
import { execute } from "@/graphql/execute";
import { useCaseProgress, useStepGating } from "../features/case-workflow";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { useExaminationResponse, type FormValues } from "../features/examination";
import { getLocalExamCompletion } from "../features/examination/hooks/use-examination-local-completion";
import { EvaluationView, useDiagnosisSync } from "../features/evaluation";

// Reuse the same GetPatientRecord query as examination route (codegen-typed)
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

export const Route = createFileRoute("/cases_/$id/evaluation")({
  component: EvaluationPage,
});

function EvaluationPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Fetch patient record
  const { data, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });

  const record = data?.patient_record_by_pk;

  // Fetch questionnaire responses
  const { data: responses, isLoading: isResponsesLoading } = useQuestionnaireResponses(id);

  // Fetch examination data
  const { data: examination, isLoading: isExaminationLoading } = useExaminationResponse(id);

  // Combine backend completedAt with localStorage fallback to avoid race conditions
  const examinationCompletedAt =
    examination?.completedAt ??
    (isExaminationLoading ? undefined : getLocalExamCompletion(id));

  // Calculate workflow progress
  const { completedSteps } = useCaseProgress({
    patientRecordId: id,
    responses: responses ?? [],
    hasPatientData: !!record?.patient_data_completed_at,
    examinationCompletedAt: examinationCompletedAt ?? null,
  });

  // Check step gating
  const { isCurrentStepAccessible, redirectStep } = useStepGating({
    caseId: id,
    completedSteps,
    currentStep: "evaluation",
  });

  // Redirect if step is not accessible
  useEffect(() => {
    if (
      !isRecordLoading &&
      !isResponsesLoading &&
      !isExaminationLoading &&
      !isCurrentStepAccessible &&
      redirectStep
    ) {
      navigate({
        to: `/cases/$id/${redirectStep}`,
        params: { id },
        replace: true,
      });
    }
  }, [
    isRecordLoading,
    isResponsesLoading,
    isExaminationLoading,
    isCurrentStepAccessible,
    redirectStep,
    navigate,
    id,
  ]);

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

  // Format patient display data
  const patientName =
    decryptedData && !isDecrypting
      ? `${decryptedData.firstName} ${decryptedData.lastName}`
      : undefined;

  const patientDob = decryptedData?.dateOfBirth
    ? formatDate(new Date(decryptedData.dateOfBirth))
    : undefined;

  // Extract SQ answers from questionnaire responses (safe before loading complete)
  const sqResponse = responses?.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);
  const sqAnswers = (sqResponse?.answers ?? {}) as Record<string, unknown>;

  // Get examination data (default to empty object if not available)
  const examinationData = (examination?.responseData ?? {}) as FormValues;

  // Diagnosis sync: compute client-side, persist to backend
  // Must be called unconditionally (React hooks rule)
  const userId = session?.user?.id ?? "";
  const isDataReady = !isRecordLoading && !isResponsesLoading && !isExaminationLoading;
  const {
    evaluation: diagnosisEvaluation,
    isSyncing,
    updateDecision,
  } = useDiagnosisSync({
    patientRecordId: id,
    sqAnswers,
    examinationData,
    userId,
    enabled: isDataReady,
  });

  // Receptionist role is read-only for decisions
  const activeRole = (session?.user as Record<string, unknown> | undefined)?.activeRole as
    | string
    | undefined;
  const isReadOnly = activeRole === "receptionist";

  const completedStepsArray = useMemo(() => Array.from(completedSteps), [completedSteps]);

  // Loading or gating redirect in progress
  if (!isDataReady || !isCurrentStepAccessible) {
    return (
      <CaseLayout
        caseId={id}
        currentStep="evaluation"
        completedSteps={completedStepsArray}
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Laden...</div>
        </div>
      </CaseLayout>
    );
  }

  return (
    <CaseLayout
      caseId={id}
      patientInternalId={record?.clinic_internal_id ?? undefined}
      currentStep="evaluation"
      completedSteps={completedStepsArray}
      patientName={patientName}
      patientDob={patientDob}
      isDecrypting={isDecrypting}
    >
      <EvaluationView
        sqAnswers={sqAnswers}
        examinationData={examinationData}
        evaluation={diagnosisEvaluation}
        onUpdateDecision={updateDecision}
        readOnly={isReadOnly || isSyncing}
        caseId={id}
      />
    </CaseLayout>
  );
}
