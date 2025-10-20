import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "../../lib/auth";
import { Header } from "../navigation/Header";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { getTranslations } from "../../config/i18n";
import { Button } from "@/components/ui/button";

export type CaseStep = "anamnesis" | "examination" | "evaluation" | "documentation" | "export";

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
    { id: "export", label: t.caseSteps.export, order: 5 },
  ];

  const isStepCompleted = (stepId: CaseStep) => completedSteps.includes(stepId);
  const isStepCurrent = (stepId: CaseStep) => stepId === currentStep;

  const handleCloseCase = () => {
    navigate({ to: "/cases" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Stepper */}
        <aside className="w-64 border-r bg-background flex-shrink-0 overflow-y-auto">
          {/* Case Info Section */}
          <div className="p-6 border-b space-y-3">
            {patientInternalId && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t.caseSteps.patientIdLabel}</div>
                <div className="font-semibold text-sm">{patientInternalId}</div>
              </div>
            )}

            {patientName && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t.columns.patientName}</div>
                <div className="font-medium text-sm">
                  {isDecrypting ? t.loadingStates.decrypting : patientName}
                </div>
              </div>
            )}

            {patientDob && !isDecrypting && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">{t.columns.dob}</div>
                <div className="text-sm">{patientDob}</div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseCase}
              className="w-full justify-start"
            >
              <X className="h-4 w-4 mr-2" />
              {t.caseSteps.closeCase}
            </Button>
          </div>

          <nav className="p-6 space-y-2">
            {steps.map((step) => {
              const completed = isStepCompleted(step.id);
              const current = isStepCurrent(step.id);

              // Only anamnesis route exists for now
              if (step.id === "anamnesis") {
                return (
                  <Link
                    key={step.id}
                    to="/cases/$id/anamnesis"
                    params={{ id: caseId }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      current && "bg-primary text-primary-foreground",
                      !current && completed && "text-foreground hover:bg-muted",
                      !current && !completed && "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {/* Step indicator */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0",
                        current && "border-primary-foreground bg-primary-foreground text-primary",
                        !current && completed && "border-primary bg-primary text-primary-foreground",
                        !current && !completed && "border-muted-foreground"
                      )}
                    >
                      {completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{step.order}</span>
                      )}
                    </div>

                    {/* Step label */}
                    <span>{step.label}</span>
                  </Link>
                );
              }

              // Placeholder for other steps (not yet implemented)
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                    current && "bg-primary text-primary-foreground",
                    !current && completed && "text-foreground",
                    !current && !completed && "text-muted-foreground"
                  )}
                >
                  {/* Step indicator */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0",
                      current && "border-primary-foreground bg-primary-foreground text-primary",
                      !current && completed && "border-primary bg-primary text-primary-foreground",
                      !current && !completed && "border-muted-foreground"
                    )}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{step.order}</span>
                    )}
                  </div>

                  {/* Step label */}
                  <span>{step.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
