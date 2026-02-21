/**
 * Documentation Layout Route
 *
 * Layout component for the Documentation workflow step.
 * Provides sub-step navigation tabs and renders child routes via Outlet.
 *
 * Route: /cases/:id/documentation
 * Parent: cases_.$id.tsx (gets KeySetupGuard + CaseWorkflowProvider)
 */

import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CaseLayout } from "../components/layouts/CaseLayout";
import { formatDate } from "@/lib/date-utils";
import { decryptPatientData, loadPrivateKey } from "@/crypto";
import type { PatientPII } from "@/crypto/types";
import { graphql } from "@/graphql";
import { execute } from "@/graphql/execute";
import {
  getStepDefinition,
  SubStepTabs,
  useCaseProgress,
  useStepGating,
} from "../features/case-workflow";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { useExaminationResponse } from "../features/examination";
import { getLocalExamCompletion } from "../features/examination/hooks/use-examination-local-completion";
import { useNavigate } from "@tanstack/react-router";

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

export const Route = createFileRoute("/cases_/$id/documentation")({
  component: DocumentationLayout,
});

function DocumentationLayout() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

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

  // Combine backend completedAt with localStorage fallback to avoid race conditions:
  // - Backend data present → use backend (authoritative)
  // - Query still loading → undefined (don't compute progress yet)
  // - Query done, no data → check localStorage marker written on completion
  const examinationCompletedAt =
    examination?.completedAt ??
    (isExamLoading ? undefined : getLocalExamCompletion(id));

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
    >
      <div className="space-y-4">
        {/* Sub-step navigation tabs */}
        <SubStepTabs
          caseId={id}
          parentStep="documentation"
          subSteps={subSteps}
          className="rounded-t-lg -mx-4 lg:-mx-8 -mt-6 lg:-mt-8 mb-6"
        />

        {/* Child route content */}
        <Outlet />
      </div>
    </CaseLayout>
  );
}
