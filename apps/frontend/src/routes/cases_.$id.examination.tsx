/**
 * Examination Layout Route
 *
 * Layout component for the Examination workflow step.
 * Provides section tabs and renders child routes via Outlet.
 * Requires anamnesis to be completed (gating enforced).
 */

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
import { getTranslations } from "@/config/i18n";
import { execute } from "@/graphql/execute";
import { useDecryptedPatientData } from "@/hooks/use-decrypted-patient-data";
import { useSession } from "@/lib/auth";
import { formatDate } from "@/lib/date-utils";
import { roles } from "@cmdetect/config";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useBlocker, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { CaseLayout } from "../components/layouts/CaseLayout";
import {
  getStepDefinition,
  SubStepTabs,
  useCaseProgress,
  useStepGating,
} from "../features/case-workflow";
import {
  examinationFormConfig,
  ExaminationPersistenceProvider,
  generateFormSheetPDF,
  useExaminationPersistenceContext,
  useExaminationResponse,
} from "../features/examination";
import { BehandlerSelector } from "../features/examination/components/BehandlerSelector";
import { usePhysicians } from "../features/examination/hooks/use-physicians";
import { ExaminationViewProvider } from "../features/examination/contexts/ExaminationViewContext";
import { GET_PATIENT_RECORD } from "../features/patient-records/queries";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";

export const Route = createFileRoute("/cases_/$id/examination")({
  component: ExaminationLayout,
});

function ExaminationLayout() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
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
  const { data: examination, isLoading: isExamLoading } = useExaminationResponse(id);

  const examinationCompletedAt = examination?.completedAt ?? null;

  // Behandler (examiner) state:
  // - Physician: auto-select self (they ARE the examiner)
  // - Assistant/other: must select explicitly, hydrate from backend if existing
  const { data: session } = useSession();
  const userRoles = (session?.user as Record<string, unknown> | undefined)?.roles as
    | string[]
    | undefined;
  const isPhysician = userRoles?.includes(roles.PHYSICIAN) ?? false;

  const [examinedByOverride, setExaminedBy] = useState<string | null>(null);
  const autoExaminedBy = isPhysician && session?.user?.id ? session.user.id : null;
  const examinedBy = examinedByOverride ?? examination?.examinedBy ?? autoExaminedBy;

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
    currentStep: "examination",
  });

  // Redirect if step is not accessible
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
  }, [
    isRecordLoading,
    isResponsesLoading,
    isExamLoading,
    isCurrentStepAccessible,
    redirectStep,
    navigate,
    id,
  ]);

  const { decryptedData, isDecrypting } = useDecryptedPatientData(record?.first_name_encrypted, {
    isDemo: record?.is_demo ?? false,
    clinicInternalId: record?.clinic_internal_id,
  });

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
  if (isRecordLoading || isResponsesLoading || isExamLoading || !isCurrentStepAccessible) {
    return (
      <CaseLayout caseId={id} currentStep="examination" completedSteps={completedStepsArray}>
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
      isDemo={record?.is_demo ?? false}
    >
      <FormProvider {...form}>
        <ExaminationPersistenceProvider patientRecordId={id} examinedBy={examinedBy ?? ""}>
          <ExaminationContent
            caseId={id}
            subSteps={subSteps}
            patientName={patientName}
            patientDob={patientDob}
            clinicInternalId={record?.clinic_internal_id ?? undefined}
            examinedBy={examinedBy}
            onExaminedByChange={setExaminedBy}
            isExaminationCompleted={examinationCompletedAt !== null}
            isPhysician={isPhysician}
          />
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
  patientName,
  patientDob,
  clinicInternalId,
  examinedBy,
  onExaminedByChange,
  isExaminationCompleted,
  isPhysician,
}: {
  caseId: string;
  subSteps: { id: string; label: string; order: number; route: string }[];
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
  examinedBy: string | null;
  onExaminedByChange: (id: string) => void;
  isExaminationCompleted: boolean;
  isPhysician: boolean;
}) {
  const {
    isHydrated,
    status,
    completeExamination,
    flushSave,
    isSaving,
    hasUnsavedBackendChangesRef,
  } = useExaminationPersistenceContext();
  const { getValues } = useFormContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const t = getTranslations();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const { data: physicians } = usePhysicians();

  // Resolve examiner ID → name
  const examinerName = useMemo(() => {
    if (!examinedBy || !physicians) return undefined;
    return physicians.find((p) => p.id === examinedBy)?.name;
  }, [examinedBy, physicians]);

  // Detect if we're on a guided section route (e1-e10) vs the form sheet index
  const isGuidedMode = /\/e\d+/.test(pathname);

  const viewContextValue = useMemo(
    () => ({ patientName, patientDob, clinicInternalId, examinerName }),
    [patientName, patientDob, clinicInternalId, examinerName]
  );

  const handleExportPDF = useCallback(() => {
    const examDate = new Date().toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    generateFormSheetPDF({
      formValues: getValues() as Record<string, unknown>,
      patientName,
      patientDob,
      clinicInternalId,
      examDate,
      examinerName,
    });
  }, [getValues, patientName, patientDob, clinicInternalId, examinerName]);

  // Block SPA navigation when there are unsaved changes: try to save first,
  // show a dialog only if saving fails. Also covers browser close/refresh via enableBeforeUnload.
  const shouldBlockFn = useCallback(
    async ({ next }: { next: { pathname: string } }) => {
      // Allow navigation within examination child routes (provider stays mounted)
      if (next.pathname.includes(`/cases/${caseId}/examination`)) return false;
      // No unsaved changes — allow navigation
      if (!hasUnsavedBackendChangesRef.current) return false;
      // Unsaved changes — try to save before navigating
      try {
        await flushSave();
        return false;
      } catch {
        return true;
      }
    },
    [caseId, flushSave, hasUnsavedBackendChangesRef]
  );
  const enableBeforeUnload = useCallback(
    () => hasUnsavedBackendChangesRef.current,
    [hasUnsavedBackendChangesRef]
  );
  const blocker = useBlocker({ shouldBlockFn, enableBeforeUnload, withResolver: true });

  const handleCompleteExamination = async () => {
    setShowCompleteDialog(false);
    await completeExamination();
    navigate({ to: "/cases/$id/evaluation", params: { id: caseId } });
  };

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

  // Gate: require Behandler selection before examination access (non-physicians only)
  if (!examinedBy && !isPhysician) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <h2 className="text-lg font-semibold">{t.examination.behandlerLabel}</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {t.examination.selectBehandlerGate}
        </p>
        <BehandlerSelector value={examinedBy} onChange={onExaminedByChange} />
      </div>
    );
  }

  return (
    <ExaminationViewProvider {...viewContextValue}>
      <div className="space-y-4 print:space-y-0">
        {/* Sub-step navigation tabs — only in guided mode */}
        {isGuidedMode && (
          <SubStepTabs
            caseId={caseId}
            parentStep="examination"
            subSteps={subSteps}
            className="-mx-4 xl:-mx-8 mb-6 -mt-6 xl:-mt-8 sticky top-0 z-10 bg-background print:hidden"
          />
        )}

        {/* Status-conditional action buttons */}
        <div className="flex items-center justify-end gap-2 print:hidden">
          {/* Back to form sheet — only in guided mode */}
          {isGuidedMode && (
            <Button variant="ghost" size="sm" asChild className="mr-auto">
              <Link to="/cases/$id/examination" params={{ id: caseId }}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Formularbogen
              </Link>
            </Button>
          )}

          {/* Behandler selector — only for non-physicians (assistants) */}
          {!isPhysician && (
            <BehandlerSelector
              value={examinedBy}
              onChange={onExaminedByChange}
              disabled={isExaminationCompleted}
            />
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              PDF Export
            </Button>

            {status === "completed" ? (
              <Button size="sm" asChild>
                <Link to="/cases/$id/evaluation" params={{ id: caseId }}>
                  Zur Auswertung
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowCompleteDialog(true)}>
                Untersuchung abschließen
              </Button>
            )}
          </div>
        </div>

        {/* Content — always rendered via child routes (index = form sheet, e1-e10 = guided) */}
        <Outlet />

        <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Untersuchung abschließen?</AlertDialogTitle>
              <AlertDialogDescription>
                Sie können die Untersuchung jetzt abschließen. Sie können die Untersuchung
                nachträglich bearbeiten.
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

        {/* Blocker dialog — shown only when save-before-navigate failed */}
        <AlertDialog open={blocker.status === "blocked"}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ungespeicherte Änderungen</AlertDialogTitle>
              <AlertDialogDescription>
                Die Änderungen konnten nicht gespeichert werden. Möchten Sie ohne Speichern
                fortfahren?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => blocker.reset?.()}>Abbrechen</AlertDialogCancel>
              <Button variant="destructive" onClick={() => blocker.proceed?.()}>
                Ohne Speichern fortfahren
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ExaminationViewProvider>
  );
}
