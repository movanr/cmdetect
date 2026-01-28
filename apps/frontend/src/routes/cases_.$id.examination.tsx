/**
 * Examination Layout Route
 *
 * Layout component for the Examination workflow step.
 * Provides section tabs and renders child routes via Outlet.
 * Requires anamnesis to be completed (gating enforced).
 */

import { useEffect, useState } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
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
import { examinationFormConfig } from "../features/examination/form/use-examination-form";

// GraphQL query for patient record
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

export const Route = createFileRoute("/cases_/$id/examination")({
  component: ExaminationLayout,
});

function ExaminationLayout() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Create examination form (provides FormContext to children)
  const form = useForm(examinationFormConfig);

  // Fetch patient record
  const { data, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
  });

  const record = data?.patient_record_by_pk;

  // Fetch questionnaire responses for workflow progress
  const { data: responses, isLoading: isResponsesLoading } = useQuestionnaireResponses(id);

  // Calculate workflow progress
  const { completedSteps } = useCaseProgress({
    patientRecordId: id,
    responses: responses ?? [],
    hasPatientData: !!record?.patient_data_completed_at,
  });

  // Check step gating
  const { isCurrentStepAccessible, redirectStep } = useStepGating({
    caseId: id,
    completedSteps,
    currentStep: "examination",
  });

  // Redirect if step is not accessible
  useEffect(() => {
    if (!isRecordLoading && !isResponsesLoading && !isCurrentStepAccessible && redirectStep) {
      navigate({
        to: `/cases/$id/${redirectStep}`,
        params: { id },
        replace: true,
      });
    }
  }, [isRecordLoading, isResponsesLoading, isCurrentStepAccessible, redirectStep, navigate, id]);

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

  // Get examination step definition for sub-steps
  const examinationStep = getStepDefinition("examination");
  const subSteps = examinationStep?.subSteps ?? [];

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

  // Loading or gating redirect in progress
  if (isRecordLoading || isResponsesLoading || !isCurrentStepAccessible) {
    return (
      <CaseLayout
        caseId={id}
        currentStep="examination"
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
      currentStep="examination"
      completedSteps={completedStepsArray}
      patientName={patientName}
      patientDob={patientDob}
      isDecrypting={isDecrypting}
    >
      <FormProvider {...form}>
        <div className="space-y-4">
          {/* Sub-step navigation tabs */}
          <SubStepTabs
            caseId={id}
            parentStep="examination"
            subSteps={subSteps}
            className="rounded-t-lg -mx-4 lg:-mx-8 -mt-6 lg:-mt-8 mb-6"
          />

          {/* Child route content */}
          <Outlet />
        </div>
      </FormProvider>
    </CaseLayout>
  );
}
