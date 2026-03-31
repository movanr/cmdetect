import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "../../lib/auth";
import { Header } from "../navigation/Header";
import { cn } from "@/lib/utils";
import { Check, X, Lock, RotateCcw } from "lucide-react";
import { getTranslations } from "../../config/i18n";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { execute } from "@/graphql/execute";
import { MARK_VIEWED, RESET_DEMO_CASE } from "@/features/patient-records/queries";
import { examinationDefaults } from "@/features/examination";
import { canAccessStep, type MainStep } from "../../features/case-workflow";
import { toast } from "sonner";

export type CaseStep = "anamnesis" | "examination" | "evaluation" | "documentation";

interface CaseLayoutProps {
  children: React.ReactNode;
  caseId: string; // The actual case ID (record.id) used for routing
  patientInternalId?: string; // The clinic internal ID shown to user
  currentStep: CaseStep;
  completedSteps?: CaseStep[];
  patientName?: string;
  patientDob?: string;
  isDecrypting?: boolean;
  isDemo?: boolean;
}

interface StepConfig {
  id: CaseStep;
  label: string;
  order: number;
}

export function CaseLayout({
  children,
  caseId,
  patientInternalId,
  currentStep,
  completedSteps = [],
  patientName,
  patientDob,
  isDecrypting = false,
  isDemo = false,
}: CaseLayoutProps) {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const t = getTranslations();
  const queryClient = useQueryClient();

  // Mark case as viewed on first mount
  const hasMarkedViewed = useRef(false);
  useEffect(() => {
    if (caseId && !hasMarkedViewed.current) {
      hasMarkedViewed.current = true;
      execute(MARK_VIEWED, { id: caseId }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["patient-record", caseId] });
        queryClient.invalidateQueries({ queryKey: ["patient-records"] });
      });
    }
  }, [caseId, queryClient]);

  const resetMutation = useMutation({
    mutationFn: () => execute(RESET_DEMO_CASE, {
      patient_record_id: caseId,
      empty_response_data: examinationDefaults,
    }),
    onSuccess: () => {
      // Full page reload to kill all in-memory form state and prevent
      // the examination auto-save flush from writing stale data back.
      window.location.href = `/cases/${caseId}/anamnesis`;
    },
    onError: (error) => {
      console.error("Reset demo case failed:", error);
      toast.error(error instanceof Error ? error.message : "Reset failed");
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  const steps: StepConfig[] = [
    { id: "anamnesis", label: t.caseSteps.anamnesis, order: 1 },
    { id: "examination", label: t.caseSteps.examination, order: 2 },
    { id: "evaluation", label: t.caseSteps.evaluation, order: 3 },
    { id: "documentation", label: t.caseSteps.documentation, order: 4 },
  ];

  const isStepCompleted = (stepId: CaseStep) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: CaseStep) => stepId === currentStep;
  const completedStepsSet = new Set<MainStep>(completedSteps);
  const isStepAccessible = (stepId: CaseStep) => canAccessStep(stepId as MainStep, completedStepsSet);

  const handleCloseCase = () => {
    navigate({ to: "/cases" });
  };

  const hasPatientInfo = patientInternalId || patientName || patientDob || isDecrypting;

  const getStepRoute = (stepId: CaseStep) => {
    if (stepId === "anamnesis") return "/cases/$id/anamnesis";
    if (stepId === "examination") return "/cases/$id/examination";
    if (stepId === "documentation") return "/cases/$id/documentation";
    return "/cases/$id/evaluation";
  };

  // Reusable sidebar content (desktop)
  const sidebarContent = (
    <>
      <nav className="p-6 space-y-2">
        {steps.map((step) => {
          const completed = isStepCompleted(step.id);
          const current = isStepCurrent(step.id);
          const accessible = isStepAccessible(step.id);

          const stepIndicator = (
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0",
                current && "border-primary-foreground bg-primary-foreground text-primary",
                !current && completed && "border-primary bg-primary text-primary-foreground",
                !current && !completed && accessible && "border-muted-foreground",
                !current && !completed && !accessible && "border-muted-foreground/50"
              )}
            >
              {completed ? (
                <Check className="h-4 w-4" />
              ) : !accessible ? (
                <Lock className="h-3 w-3" />
              ) : (
                <span className="text-xs">{step.order}</span>
              )}
            </div>
          );

          if (accessible) {
            return (
              <Link
                key={step.id}
                to={getStepRoute(step.id)}
                params={{ id: caseId }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  current && "bg-primary text-primary-foreground",
                  !current && completed && "text-foreground hover:bg-muted",
                  !current && !completed && "text-muted-foreground hover:bg-muted"
                )}
              >
                {stepIndicator}
                <span>{step.label}</span>
              </Link>
            );
          }

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                current && "bg-primary text-primary-foreground",
                !current && completed && "text-foreground",
                !current && !completed && accessible && "text-muted-foreground",
                !current && !completed && !accessible && "text-muted-foreground/50"
              )}
            >
              {stepIndicator}
              <span>{step.label}</span>
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-background print:h-auto">
      {/* Header — hidden in print */}
      <div className="print:hidden">
        <Header />
      </div>

      {/* Patient info top bar — hidden in print */}
      {hasPatientInfo && (
        <div className="print:hidden flex flex-wrap items-center gap-x-4 gap-y-1 border-b bg-muted/40 px-4 py-2 xl:px-6 shrink-0">
          {isDemo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetMutation.mutate()}
                  disabled={resetMutation.isPending}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className={cn("h-3.5 w-3.5", resetMutation.isPending && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t.demoCase.resetTooltip}</TooltipContent>
            </Tooltip>
          )}
          {patientInternalId && (
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-muted-foreground shrink-0">{t.caseSteps.patientIdLabel}:</span>
              <span className="font-semibold truncate">{patientInternalId}</span>
            </div>
          )}
          {patientName && (
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-muted-foreground shrink-0">{t.columns.patientName}:</span>
              <span className="font-medium truncate max-w-[180px]">
                {isDecrypting ? t.loadingStates.decrypting : patientName}
              </span>
            </div>
          )}
          {patientDob && !isDecrypting && (
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-muted-foreground shrink-0">{t.columns.dob}:</span>
              <span className="shrink-0">{patientDob}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseCase}
            className="ml-auto h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Horizontal step nav — mobile/tablet only (< xl), hidden in print */}
      <div className="xl:hidden border-b bg-background shrink-0 print:hidden">
        <nav className="flex" aria-label="Schritte">
          {steps.map((step) => {
            const completed = isStepCompleted(step.id);
            const current = isStepCurrent(step.id);
            const accessible = isStepAccessible(step.id);

            const indicator = (
              <div
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0",
                  current && "border-primary bg-primary text-primary-foreground",
                  !current && completed && "border-primary bg-primary text-primary-foreground",
                  !current && !completed && accessible && "border-muted-foreground text-muted-foreground",
                  !current && !completed && !accessible && "border-muted-foreground/40 text-muted-foreground/40"
                )}
              >
                {completed ? (
                  <Check className="h-3 w-3" />
                ) : !accessible ? (
                  <Lock className="h-2.5 w-2.5" />
                ) : (
                  <span className="text-[10px] leading-none">{step.order}</span>
                )}
              </div>
            );

            const itemClass = cn(
              "flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              current && "border-primary text-primary",
              !current && completed && "border-transparent text-foreground hover:border-muted-foreground/40",
              !current && !completed && accessible && "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40",
              !current && !completed && !accessible && "border-transparent text-muted-foreground/40 cursor-default",
            );

            if (accessible) {
              return (
                <Link
                  key={step.id}
                  to={getStepRoute(step.id)}
                  params={{ id: caseId }}
                  className={itemClass}
                >
                  {indicator}
                  <span>{step.label}</span>
                </Link>
              );
            }

            return (
              <div key={step.id} className={itemClass}>
                {indicator}
                <span>{step.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Content area */}
      <div className="flex flex-1 min-h-0">
        {/* Static sidebar — desktop only (xl+), hidden in print */}
        <aside className="hidden xl:block print:!hidden w-56 border-r bg-background flex-shrink-0 overflow-y-auto">
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main id="main-scroll-container" className="flex-1 overflow-auto print:overflow-visible">
          <div className="px-4 py-6 xl:px-8 xl:py-8 print:p-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
