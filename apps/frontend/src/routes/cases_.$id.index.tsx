import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
  useCaseProgress,
  getFirstIncompleteStep,
  type MainStep,
} from "../features/case-workflow";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { useExaminationResponse } from "../features/examination";

export const Route = createFileRoute("/cases_/$id/")({
  component: CaseIndexRedirect,
});

const STEP_ROUTES: Record<MainStep, string> = {
  anamnesis: "/cases/$id/anamnesis",
  examination: "/cases/$id/examination",
  evaluation: "/cases/$id/evaluation",
  documentation: "/cases/$id/documentation",
} as const;

/**
 * Smart redirect: lands on the first incomplete workflow step.
 *
 * Queries share TanStack Query cache with layout routes, so subsequent
 * pages load instantly from cache.
 */
function CaseIndexRedirect() {
  const { id } = Route.useParams();

  const { data: responses, isLoading: isResponsesLoading } =
    useQuestionnaireResponses(id);
  const { data: examination, isLoading: isExaminationLoading } =
    useExaminationResponse(id);

  const { completedSteps } = useCaseProgress({
    patientRecordId: id,
    responses: responses ?? [],
    hasPatientData: true,
    examinationCompletedAt: examination?.completedAt,
  });

  // Show brief loading while queries resolve
  if (isResponsesLoading || isExaminationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Laden...</div>
      </div>
    );
  }

  const targetStep = getFirstIncompleteStep(completedSteps);
  const targetRoute = STEP_ROUTES[targetStep];

  return <Navigate to={targetRoute} params={{ id }} replace />;
}
