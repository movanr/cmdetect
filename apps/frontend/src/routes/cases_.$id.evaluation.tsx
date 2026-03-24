/**
 * Evaluation Route
 *
 * Displays DC/TMD diagnosis evaluation results for a case.
 * Fetches SQ questionnaire answers and examination data,
 * then renders the evaluation view with diagnosis reference list.
 */

import { useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { CaseLayout } from "../components/layouts/CaseLayout";
import { formatDate } from "@/lib/date-utils";
import { execute } from "@/graphql/execute";
import { useDecryptedPatientData } from "@/hooks/use-decrypted-patient-data";
import { useCaseProgress, useStepGating } from "../features/case-workflow";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { useExaminationResponse, getLocalExamCompletion, type FormValues } from "../features/examination";
import { EvaluationView } from "../features/evaluation";
import { GET_PATIENT_RECORD } from "../features/patient-records/queries";

export const Route = createFileRoute("/cases_/$id/evaluation")({
  component: EvaluationPage,
});

function EvaluationPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
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

  const { decryptedData, isDecrypting } = useDecryptedPatientData(record?.first_name_encrypted);

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

  const completedStepsArray = useMemo(() => Array.from(completedSteps), [completedSteps]);

  const isDataReady = !isRecordLoading && !isResponsesLoading && !isExaminationLoading;

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
        caseId={id}
      />
    </CaseLayout>
  );
}
