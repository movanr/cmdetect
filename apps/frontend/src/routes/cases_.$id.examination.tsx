/**
 * Examination Layout Route
 *
 * Layout component for the Examination workflow step.
 * Provides section tabs and renders child routes via Outlet.
 * Requires anamnesis to be completed (gating enforced).
 */

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
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
import { FormProvider, useForm, useFormContext } from "react-hook-form";
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
import {
  DCTMDFormSheet,
  examinationFormConfig,
  ExaminationPersistenceProvider,
  generateFormSheetPDF,
  useExaminationPersistenceContext,
  useExaminationResponse,
} from "../features/examination";
import { BehandlerSelector } from "../features/examination/components/BehandlerSelector";
import { getTranslations } from "@/config/i18n";
import { useSession } from "@/lib/auth";
import { roles } from "@cmdetect/config";
import { GET_PATIENT_RECORD } from "../features/patient-records/queries";

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
    if (!isRecordLoading && !isResponsesLoading && !isExamLoading && !isCurrentStepAccessible && redirectStep) {
      navigate({
        to: `/cases/$id/${redirectStep}`,
        params: { id },
        replace: true,
      });
    }
  }, [isRecordLoading, isResponsesLoading, isExamLoading, isCurrentStepAccessible, redirectStep, navigate, id]);

  const { decryptedData, isDecrypting } = useDecryptedPatientData(record?.first_name_encrypted);

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
type ViewMode = "wizard" | "formSheet";

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
  const { isHydrated, status, completeExamination, isSaving, hasUnsavedBackendChangesRef } = useExaminationPersistenceContext();
  const { getValues } = useFormContext();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const t = getTranslations();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const stored = sessionStorage.getItem("examination-view-mode");
    return stored === "formSheet" ? "formSheet" : "wizard";
  });

  const setViewModeAndPersist = (mode: ViewMode) => {
    setViewMode(mode);
    sessionStorage.setItem("examination-view-mode", mode);
  };

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
    });
  }, [getValues, patientName, patientDob, clinicInternalId]);

  // Warn on browser tab close / page refresh (SPA navigation is handled by unmount flush)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedBackendChangesRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedBackendChangesRef]);

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
        <BehandlerSelector
          value={examinedBy}
          onChange={onExaminedByChange}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 print:space-y-0">
      {/* Sub-step navigation tabs — only in wizard mode */}
      {viewMode === "wizard" && (
        <SubStepTabs
          caseId={caseId}
          parentStep="examination"
          subSteps={subSteps}
          className="-mx-4 xl:-mx-8 mb-6 -mt-6 xl:-mt-8 sticky top-0 z-10 bg-background print:hidden"
        />
      )}

      {/* Status-conditional action buttons */}
      <div className="flex items-center justify-end gap-2 print:hidden">
        {/* Behandler selector — only for non-physicians (assistants) */}
        {!isPhysician && (
          <BehandlerSelector
            value={examinedBy}
            onChange={onExaminedByChange}
            disabled={isExaminationCompleted}
          />
        )}

        {/* View mode toggle */}
        <div className="ml-auto flex rounded-md border border-input overflow-hidden">
          <button
            type="button"
            onClick={() => setViewModeAndPersist("wizard")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === "wizard"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Schritt-für-Schritt
          </button>
          <button
            type="button"
            onClick={() => setViewModeAndPersist("formSheet")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === "formSheet"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            Formularbogen
          </button>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          PDF Export
        </Button>

        {status === "completed" ? (
          <Button
            size="sm"
            onClick={() => navigate({ to: "/cases/$id/evaluation", params: { id: caseId } })}
          >
            Zur Auswertung
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setShowCompleteDialog(true)}>
            Untersuchung abschließen
          </Button>
        )}
      </div>

      {/* Content — wizard (child routes) or form sheet */}
      {viewMode === "wizard" ? (
        <Outlet />
      ) : (
        <DCTMDFormSheet
          patientName={patientName}
          patientDob={patientDob}
          clinicInternalId={clinicInternalId}
        />
      )}

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
