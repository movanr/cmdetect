/**
 * /phq4 route - Patient Health Questionnaire-4
 * Standalone route for development and testing
 */

import { createFileRoute } from "@tanstack/react-router";
import { FormProvider } from "react-hook-form";
import {
  PHQ4Wizard,
  usePHQ4Form,
  loadProgress,
  PHQ4_QUESTIONNAIRE,
} from "../features/phq4";

interface PHQ4SearchParams {
  token?: string;
}

export const Route = createFileRoute("/phq4")({
  validateSearch: (search: Record<string, unknown>): PHQ4SearchParams => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: PHQ4Page,
});

function PHQ4Page() {
  const { token } = Route.useSearch();

  // For development, allow access without token
  const effectiveToken = token ?? "dev-token";

  // Load any saved progress
  const savedProgress = loadProgress(effectiveToken);

  // Initialize form with saved answers
  const methods = usePHQ4Form(savedProgress?.answers);

  const handleComplete = (answers: Record<string, string>) => {
    console.log("PHQ-4 completed:", answers);
    // TODO: In production, submit to backend via GraphQL mutation
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">{PHQ4_QUESTIONNAIRE.title}</h1>
          <p className="text-sm text-muted-foreground">
            Gesundheitsfragebogen
          </p>
        </div>
      </header>

      <main className="py-6">
        <FormProvider {...methods}>
          <PHQ4Wizard
            token={effectiveToken}
            initialIndex={savedProgress?.currentIndex}
            onComplete={handleComplete}
          />
        </FormProvider>
      </main>
    </div>
  );
}
