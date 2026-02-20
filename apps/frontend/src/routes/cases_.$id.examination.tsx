/**
 * Examination Layout Route
 *
 * Layout component for the Examination workflow step.
 * Provides section tabs and renders child routes via Outlet.
 * Requires anamnesis to be completed (gating enforced).
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { ExaminationPersistenceProvider, ExaminationSummary, useExaminationPersistenceContext, useExaminationResponse } from "../features/examination";

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

  // Fetch examination response for workflow progress (shares cache with persistence provider)
  const { data: examination } = useExaminationResponse(id);

  // Calculate workflow progress
  const { completedSteps } = useCaseProgress({
    patientRecordId: id,
    responses: responses ?? [],
    hasPatientData: !!record?.patient_data_completed_at,
    examinationCompletedAt: examination?.completedAt,
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
        <ExaminationPersistenceProvider patientRecordId={id}>
          <ExaminationContent caseId={id} subSteps={subSteps} />
        </ExaminationPersistenceProvider>
      </FormProvider>
    </CaseLayout>
  );
}

/**
 * Inner component that handles hydration loading state.
 * Separated to access persistence context after provider is mounted.
 */
function ExaminationContent({
  caseId,
  subSteps,
}: {
  caseId: string;
  subSteps: { id: string; label: string; order: number; route: string }[];
}) {
  const { isHydrated, status, saveDraft, completeExamination, isSaving } = useExaminationPersistenceContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const handleCompleteExamination = async () => {
    setShowCompleteDialog(false);
    await completeExamination();
    navigate({ to: "/cases/$id/evaluation", params: { id: caseId } });
  };

  // Save draft to backend when navigating between examination sections
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      saveDraft();
    }
  }, [pathname, saveDraft]);

  // Scroll main container to top when navigating between examination sections
  useLayoutEffect(() => {
    const container = document.getElementById("main-scroll-container");
    if (container) {
      container.scrollTop = 0;
    }
  }, [pathname]);

  // Show loading while hydrating form data from backend/localStorage
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Untersuchungsdaten werden geladen...</div>
      </div>
    );
  }

  // Show readonly summary for completed examinations
  if (status === "completed") {
    return <ExaminationSummary caseId={caseId} />;
  }

  return (
    <div className="space-y-4">
      {/* Sub-step navigation tabs */}
      <SubStepTabs
        caseId={caseId}
        parentStep="examination"
        subSteps={subSteps}
        className="rounded-t-lg -mx-4 xl:-mx-8 mb-6 -mt-6 xl:-mt-8"
      />

      {/* Complete at any time */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setShowCompleteDialog(true)}>
          Untersuchung abschließen
        </Button>
      </div>

      {/* Child route content */}
      <Outlet />

      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Untersuchung abschließen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sie können die Untersuchung jetzt abschließen. Abschnitte, die noch nicht
              ausgefüllt wurden, bleiben leer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteExamination} disabled={isSaving}>
              Abschließen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
