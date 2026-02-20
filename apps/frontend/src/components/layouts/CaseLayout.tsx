import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../../lib/auth";
import { Header } from "../navigation/Header";
import { cn } from "@/lib/utils";
import { Check, X, Lock } from "lucide-react";
import { getTranslations } from "../../config/i18n";
import { Button } from "@/components/ui/button";
import { canAccessStep, type MainStep } from "../../features/case-workflow";

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
  isDecrypting = false
}: CaseLayoutProps) {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const t = getTranslations();

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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Patient info top bar */}
      {hasPatientInfo && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b bg-muted/40 px-4 py-2 xl:px-6 shrink-0">
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

      {/* Horizontal step nav — mobile/tablet only (< xl) */}
      <div className="xl:hidden border-b bg-background shrink-0">
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
        {/* Static sidebar — desktop only (xl+) */}
        <aside className="hidden xl:block w-56 border-r bg-background flex-shrink-0 overflow-y-auto">
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main id="main-scroll-container" className="flex-1 overflow-auto">
          <div className="px-4 py-6 xl:px-8 xl:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
