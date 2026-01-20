/**
 * Anamnesis Review Route
 *
 * Dashboard view showing questionnaire overview and scores.
 * First sub-step of the Anamnesis workflow.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuestionnaireResponses } from "../features/questionnaire-viewer";
import { DashboardView } from "../features/questionnaire-viewer/components/dashboard";

export const Route = createFileRoute("/cases_/$id/anamnesis/review")({
  component: AnamnesisReviewPage,
});

function AnamnesisReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Fetch questionnaire responses
  const { data: responses, isLoading } = useQuestionnaireResponses(id);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Navigate to wizard sub-step
  const handleStartReview = () => {
    navigate({
      to: "/cases/$id/anamnesis/wizard",
      params: { id },
    });
  };

  return (
    <DashboardView
      responses={responses ?? []}
      onStartReview={handleStartReview}
    />
  );
}
