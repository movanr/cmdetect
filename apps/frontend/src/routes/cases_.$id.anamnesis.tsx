/**
 * Anamnesis Layout Route
 *
 * Layout component for the Anamnesis workflow step.
 * Provides sub-step navigation tabs and renders child routes via Outlet.
 */

import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "../features/case-workflow";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { useExaminationResponse } from "../features/examination";

// GraphQL queries (same as original)
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

const UPDATE_VIEWED = graphql(`
  mutation UpdateViewed($id: String!) {
    update_patient_record_by_pk(pk_columns: { id: $id }, _set: { viewed: true }) {
      id
      viewed
    }
  }
`);

export const Route = createFileRoute("/cases_/$id/anamnesis")({
  component: AnamnesisLayout,
});

function AnamnesisLayout() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

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

  // Update last viewed mutation
  const updateViewedMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => execute(UPDATE_VIEWED, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-record", id] });
      queryClient.invalidateQueries({ queryKey: ["patient-records"] });
    },
  });

  // Update last_viewed on mount
  useEffect(() => {
    if (record?.id && !updateViewedMutation.isPending) {
      updateViewedMutation.mutate({ id: record.id });
    }
  }, [record?.id, updateViewedMutation]);

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
