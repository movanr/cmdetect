/**
 * Anamnesis Review Route
 *
 * Dashboard view showing questionnaire overview and scores.
 * First sub-step of the Anamnesis workflow.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useQuestionnaireResponses,
  useUpdateQuestionnaireResponse,
} from "../features/questionnaire-viewer";
import { DashboardView } from "../features/questionnaire-viewer/components/dashboard";

export const Route = createFileRoute("/cases_/$id/anamnesis/review")({
  component: AnamnesisReviewPage,
});

function AnamnesisReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Fetch questionnaire responses
  const { data: responses, isLoading } = useQuestionnaireResponses(id);
  const updateMutation = useUpdateQuestionnaireResponse(id);

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

  // Navigate to examination
  const handleContinueToExamination = () => {
    navigate({
      to: "/cases/$id/examination",
      params: { id },
    });
  };

  // Mark the SQ response as reviewed without opening the wizard, then jump to examination
  const sqResponse = responses?.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);
  const handleSkipReview = async () => {
    if (!sqResponse) return;
    const updatedResponseData = {
      questionnaire_id: sqResponse.questionnaireId,
      questionnaire_version: sqResponse.questionnaireVersion,
      answers: sqResponse.answers,
      _meta: {
        // Preserve any existing reviewed_at / reviewed_by so the status badge
        // does NOT flip to "reviewed" when the clinician skips the review.
        ...(sqResponse.reviewedAt ? { reviewed_at: sqResponse.reviewedAt } : {}),
        ...(sqResponse.reviewedBy ? { reviewed_by: sqResponse.reviewedBy } : {}),
        review_skipped_at: new Date().toISOString(),
      },
    };
    await updateMutation.mutateAsync({
      id: sqResponse.id,
      responseData: updatedResponseData,
      successMessage: "Überprüfung übersprungen",
    });
    handleContinueToExamination();
  };

  return (
    <DashboardView
      responses={responses ?? []}
      onStartReview={handleStartReview}
      onSkipReview={sqResponse ? handleSkipReview : undefined}
      isSkippingReview={updateMutation.isPending}
      onContinueToExamination={handleContinueToExamination}
      caseId={id}
    />
  );
}
