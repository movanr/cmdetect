/**
 * Examination Layout Route
 *
 * Layout component for the Examination workflow step.
 * Provides section tabs and renders child routes via Outlet.
 * Requires anamnesis to be completed (gating enforced).
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
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
import { ExaminationPersistenceProvider, ExaminationSummary, PreviewBanner, PreviewModeProvider, PreviewPersistenceProvider, useExaminationPersistenceContext, useExaminationResponse, usePreviewMode } from "../features/examination";

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

const examinationSearchSchema = z.object({
  mode: z.enum(["preview"]).optional(),
});

export const Route = createFileRoute("/cases_/$id/examination")({
  validateSearch: (search) => examinationSearchSchema.parse(search),
  component: ExaminationLayout,
});

function ExaminationLayout() {
  const { id } = Route.useParams();
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [decryptedData, setDecryptedData] = useState<PatientPII | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Preview mode: React state initialized from URL param.
  // Persists across child route navigation (layout stays mounted) but
  // resets when leaving examination entirely (layout unmounts).
  const [isPreviewMode] = useState(() => mode === "preview");

  // Create examination form (provides FormContext to children)
  const form = useForm(examinationFormConfig);

  // Fetch patient record (skip in preview mode — no patient data needed)
  const { data, isLoading: isRecordLoading } = useQuery({
    queryKey: ["patient-record", id],
    queryFn: () => execute(GET_PATIENT_RECORD, { id }),
    enabled: !isPreviewMode,
  });

  const record = isPreviewMode ? null : data?.patient_record_by_pk;

  // Fetch questionnaire responses for workflow progress
  const { data: responses, isLoading: isResponsesLoading } = useQuestionnaireResponses(id);

  // Fetch examination response for workflow progress (shares cache with persistence provider)
  const { data: examination } = useExaminationResponse(id);

  // Calculate workflow progress (only in normal mode)
  const { completedSteps } = useCaseProgress({
    patientRecordId: id,
    responses: responses ?? [],
    hasPatientData: !!record?.patient_data_completed_at,
    examinationCompletedAt: examination?.completedAt,
  });

  // Check step gating (only in normal mode)
  const { isCurrentStepAccessible, redirectStep } = useStepGating({
    caseId: id,
    completedSteps,
    currentStep: "examination",
  });

  // Redirect if step is not accessible (skip in preview mode)
  useEffect(() => {
    if (isPreviewMode) return;
    if (!isRecordLoading && !isResponsesLoading && !isCurrentStepAccessible && redirectStep) {
      navigate({
        to: `/cases/$id/${redirectStep}`,
        params: { id },
        replace: true,
      });
    }
  }, [isPreviewMode, isRecordLoading, isResponsesLoading, isCurrentStepAccessible, redirectStep, navigate, id]);

  // Decrypt patient data (skip in preview mode)
  useEffect(() => {
    if (isPreviewMode) return;

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
  }, [isPreviewMode, record?.first_name_encrypted]);

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

  // Loading or gating redirect in progress (skip in preview mode)
  if (!isPreviewMode && (isRecordLoading || isResponsesLoading || !isCurrentStepAccessible)) {
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
      patientInternalId={isPreviewMode ? undefined : (record?.clinic_internal_id ?? undefined)}
      currentStep="examination"
      completedSteps={completedStepsArray}
      patientName={isPreviewMode ? undefined : patientName}
      patientDob={isPreviewMode ? undefined : patientDob}
      isDecrypting={isPreviewMode ? false : isDecrypting}
    >
      <PreviewModeProvider isPreviewMode={isPreviewMode}>
        <FormProvider {...form}>
          {isPreviewMode ? (
            <PreviewPersistenceProvider>
              <ExaminationContent caseId={id} subSteps={subSteps} />
            </PreviewPersistenceProvider>
          ) : (
            <ExaminationPersistenceProvider patientRecordId={id}>
              <ExaminationContent caseId={id} subSteps={subSteps} />
            </ExaminationPersistenceProvider>
          )}
        </FormProvider>
      </PreviewModeProvider>
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
  const { isHydrated, status, relevantSections, saveDraft } = useExaminationPersistenceContext();
  const { isPreviewMode } = usePreviewMode();
  const { pathname } = useLocation();

  // Save draft to backend when navigating between examination sections
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      saveDraft();
    }
  }, [pathname, saveDraft]);

  // Convert relevantSections array to Set for SubStepTabs
  const relevantSteps = useMemo(
    () => (relevantSections ? new Set<string>(relevantSections) : null),
    [relevantSections]
  );

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
      {/* Preview mode banner — flush with top and sides above tabs */}
      {isPreviewMode && <PreviewBanner caseId={caseId} className="-mx-4 lg:-mx-8 -mt-6 lg:-mt-8 rounded-none border-x-0 border-t-0" />}

      {/* Sub-step navigation tabs */}
      <SubStepTabs
        caseId={caseId}
        parentStep="examination"
        subSteps={subSteps}
        relevantSteps={relevantSteps}
        className={`rounded-t-lg -mx-4 lg:-mx-8 mb-6 ${isPreviewMode ? "" : "-mt-6 lg:-mt-8"}`}
      />

      {/* Child route content */}
      <Outlet />
    </div>
  );
}
