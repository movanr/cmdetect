/**
 * /sq route - DC/TMD Symptom Questionnaire
 * Standalone route for development and testing
 */

import { createFileRoute } from "@tanstack/react-router";
import { FormProvider } from "react-hook-form";
import { SQWizard, useSQForm, loadProgress } from "../features/sq";

interface SQSearchParams {
  token?: string;
}

export const Route = createFileRoute("/sq")({
  validateSearch: (search: Record<string, unknown>): SQSearchParams => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: SQPage,
});

function SQPage() {
  const { token } = Route.useSearch();

  // For development, allow access without token
  const effectiveToken = token ?? "dev-token";

  // Load any saved progress
  const savedProgress = loadProgress(effectiveToken);

  // Initialize form with saved answers
  const methods = useSQForm({
    initialAnswers: savedProgress?.answers,
  });

  const handleComplete = (answers: Record<string, unknown>) => {
    console.log("Questionnaire completed:", answers);
    // TODO: In production, submit to backend via GraphQL mutation
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Symptom Questionnaire</h1>
          <p className="text-sm text-muted-foreground">
            DC/TMD Diagnostic Criteria
          </p>
        </div>
      </header>

      <main className="py-6">
        <FormProvider {...methods}>
          <SQWizard
            token={effectiveToken}
            initialIndex={savedProgress?.currentIndex}
            initialHistory={savedProgress?.history}
            onComplete={handleComplete}
          />
        </FormProvider>
      </main>
    </div>
  );
}
