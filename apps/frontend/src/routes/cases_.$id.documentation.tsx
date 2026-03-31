/**
 * Documentation Layout Route
 *
 * Layout component for the Documentation workflow step.
 * Provides sub-step navigation tabs and renders child routes via Outlet.
 *
 * Route: /cases/:id/documentation
 * Parent: cases_.$id.tsx (gets KeySetupGuard + CaseWorkflowProvider)
 */

import { useEffect } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CaseLayout } from "../components/layouts/CaseLayout";
import { formatDate } from "@/lib/date-utils";
import { execute } from "@/graphql/execute";
import { useDecryptedPatientData } from "@/hooks/use-decrypted-patient-data";
import {
  getStepDefinition,
  SubStepTabs,
  useCaseProgress,
  useStepGating,
} from "../features/case-workflow";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { useExaminationResponse } from "../features/examination";
import { useNavigate } from "@tanstack/react-router";
import { GET_PATIENT_RECORD } from "../features/patient-records/queries";

export const Route = createFileRoute("/cases_/$id/documentation")({
  component: DocumentationLayout,
});

function DocumentationLayout() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Fetch patient record
  const { data, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });

  const record = data?.patient_record_by_pk;

  // Fetch questionnaire responses for workflow progress
  const { data: responses, isLoading: isResponsesLoading } = useQuestionnaireResponses(id);

  // Fetch examination response for workflow progress
  const { data: examination, isLoading: isExamLoading } = useExaminationResponse(id);

  const examinationCompletedAt = examination?.completedAt ?? null;

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
    currentStep: "documentation",
  });

  // Redirect if step is not accessible — wait for all queries to finish
  // to avoid premature redirect while examination data is still loading.
  useEffect(() => {
    if (
      !isRecordLoading &&
      !isResponsesLoading &&
      !isExamLoading &&
      !isCurrentStepAccessible &&
      redirectStep
    ) {
      navigate({
        to: `/cases/$id/${redirectStep}`,
        params: { id },
        replace: true,
      });
    }
  }, [isRecordLoading, isResponsesLoading, isExamLoading, isCurrentStepAccessible, redirectStep, navigate, id]);

  const { decryptedData, isDecrypting } = useDecryptedPatientData(record?.first_name_encrypted, {
    isDemo: record?.is_demo ?? false,
    clinicInternalId: record?.clinic_internal_id,
  });

  // Get documentation step definition for sub-steps
  const documentationStep = getStepDefinition("documentation");
  const subSteps = documentationStep?.subSteps ?? [];

  // Format patient display data
  const patientName =
    decryptedData && !isDecrypting
      ? `${decryptedData.firstName} ${decryptedData.lastName}`
      : undefined;

  const patientDob = decryptedData?.dateOfBirth
    ? formatDate(new Date(decryptedData.dateOfBirth))
    : undefined;

  const completedStepsArray = Array.from(completedSteps);

  if (isRecordLoading || isResponsesLoading || isExamLoading) {
    return (
      <CaseLayout
        caseId={id}
        currentStep="documentation"
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
      currentStep="documentation"
      completedSteps={completedStepsArray}
      patientName={patientName}
      patientDob={patientDob}
      isDecrypting={isDecrypting}
      isDemo={record?.is_demo ?? false}
    >
      <div className="space-y-4">
        {/* Sub-step navigation tabs — hidden in print */}
        <SubStepTabs
          caseId={id}
          parentStep="documentation"
          subSteps={subSteps}
          className="rounded-t-lg -mx-4 lg:-mx-8 -mt-6 lg:-mt-8 mb-6 print:hidden"
        />

        {/* Child route content */}
        <Outlet />
      </div>
    </CaseLayout>
  );
}
