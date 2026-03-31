/**
 * Anamnesis Layout Route
 *
 * Layout component for the Anamnesis workflow step.
 * Provides sub-step navigation tabs and renders child routes via Outlet.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CaseLayout } from "../components/layouts/CaseLayout";
import { formatDate } from "@/lib/date-utils";
import { useDecryptedPatientData } from "@/hooks/use-decrypted-patient-data";
import { execute } from "@/graphql/execute";
import {
  getStepDefinition,
  SubStepTabs,
  useCaseProgress,
} from "../features/case-workflow";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { useExaminationResponse } from "../features/examination";
import { GET_PATIENT_RECORD } from "../features/patient-records/queries";

export const Route = createFileRoute("/cases_/$id/anamnesis")({
  component: AnamnesisLayout,
});

function AnamnesisLayout() {
  const { id } = Route.useParams();

  // Fetch patient record
  const { data, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });

  const record = data?.patient_record_by_pk;

  // Fetch questionnaire responses for workflow progress
  const { data: responses } = useQuestionnaireResponses(id);

  // Fetch examination response for workflow progress
  const { data: examination } = useExaminationResponse(id);

  // Calculate workflow progress
  const { completedSteps } = useCaseProgress({
    patientRecordId: id,
    responses: responses ?? [],
    hasPatientData: !!record?.patient_data_completed_at,
    examinationCompletedAt: examination?.completedAt,
  });

  const { decryptedData, isDecrypting } = useDecryptedPatientData(record?.first_name_encrypted, {
    isDemo: record?.is_demo ?? false,
    clinicInternalId: record?.clinic_internal_id,
  });

  // Get anamnesis step definition for sub-steps
  const anamnesisStep = getStepDefinition("anamnesis");
  const subSteps = anamnesisStep?.subSteps ?? [];

  // Format patient display data
  const patientName =
    decryptedData && !isDecrypting
      ? `${decryptedData.firstName} ${decryptedData.lastName}`
      : undefined;

  const patientDob = decryptedData?.dateOfBirth
    ? formatDate(new Date(decryptedData.dateOfBirth))
    : undefined;

  // Convert Set to array for CaseLayout
  const completedStepsArray = Array.from(completedSteps);

  // Show loading only for initial record load, not for decryption
  if (isRecordLoading) {
    return (
      <CaseLayout
        caseId={id}
        currentStep="anamnesis"
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
      currentStep="anamnesis"
      completedSteps={completedStepsArray}
      patientName={patientName}
      patientDob={patientDob}
      isDecrypting={isDecrypting}
      isDemo={record?.is_demo ?? false}
    >
      <div className="space-y-4">
        {/* Sub-step navigation tabs */}
        <SubStepTabs
          caseId={id}
          parentStep="anamnesis"
          subSteps={subSteps}
          className="rounded-t-lg -mx-4 xl:-mx-8 -mt-6 xl:-mt-8 mb-6"
        />

        {/* Child route content */}
        <Outlet />
      </div>
    </CaseLayout>
  );
}
