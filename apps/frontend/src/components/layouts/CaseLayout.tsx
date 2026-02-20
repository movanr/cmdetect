import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession } from "../../lib/auth";
import { Header } from "../navigation/Header";
import { cn } from "@/lib/utils";
import { Check, X, Menu, Lock } from "lucide-react";
import { getTranslations } from "../../config/i18n";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsNotDesktop } from "@/hooks/use-mobile";
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
  const isNotDesktop = useIsNotDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session) {
      navigate({ to: "/login" });
    }
  }, [session, navigate]);

  // Close sidebar when switching to desktop (>= 1280px)
  useEffect(() => {
    if (!isNotDesktop) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: sync sidebar state with viewport change
      setSidebarOpen(false);
    }
  }, [isNotDesktop]);

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

  // Reusable sidebar content
  const sidebarContent = (
    <>
      <nav className="p-6 space-y-2">
        {steps.map((step) => {
          const completed = isStepCompleted(step.id);
          const current = isStepCurrent(step.id);
          const accessible = isStepAccessible(step.id);

          // Implemented routes: anamnesis, examination, evaluation, documentation
          const hasRoute = step.id === "anamnesis" || step.id === "examination" || step.id === "evaluation" || step.id === "documentation";

          // Step indicator component
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

          // Render as Link if route exists and step is accessible
          if (hasRoute && accessible) {
            const route = step.id === "anamnesis"
              ? "/cases/$id/anamnesis"
              : step.id === "examination"
              ? "/cases/$id/examination"
              : step.id === "documentation"
              ? "/cases/$id/documentation"
              : "/cases/$id/evaluation";

            return (
                <Link
                  key={step.id}
                  to={route}
                  params={{ id: caseId }}
                  onClick={() => setSidebarOpen(false)}
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

          // Render as non-interactive div for inaccessible or unimplemented steps
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Patient info top bar */}
      {hasPatientInfo && (
        <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-2 xl:px-6">
          {patientInternalId && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">{t.caseSteps.patientIdLabel}:</span>
              <span className="font-semibold">{patientInternalId}</span>
            </div>
          )}
          {patientName && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">{t.columns.patientName}:</span>
              <span className="font-medium">
                {isDecrypting ? t.loadingStates.decrypting : patientName}
              </span>
            </div>
          )}
          {patientDob && !isDecrypting && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground">{t.columns.dob}:</span>
              <span>{patientDob}</span>
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

      <div className={cn("flex", hasPatientInfo ? "h-[calc(100vh-4rem-2.5rem)]" : "h-[calc(100vh-4rem)]")}>
        {/* Sidebar Sheet for tablet portrait (md to lg) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {sidebarContent}
          </SheetContent>
        </Sheet>

        {/* Static sidebar for desktop (xl and up, >= 1280px) */}
        <aside className="hidden xl:block w-56 border-r bg-background flex-shrink-0 overflow-y-auto">
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main id="main-scroll-container" className="flex-1 overflow-auto">
          {/* Sidebar toggle button - visible below xl breakpoint (< 1280px) */}
          <div className="sticky top-0 z-10 bg-background border-b px-4 py-2 xl:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="min-h-[44px] min-w-[44px] p-2"
            >
              <Menu className="h-5 w-5" />
              <span className="ml-2">Menu</span>
            </Button>
          </div>
          <div className="px-4 py-6 xl:px-8 xl:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
