/**
 * Anamnesis Review Route
 *
 * Dashboard view showing questionnaire overview and scores.
 * First sub-step of the Anamnesis workflow.
 */

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useBlocker, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import {
  useQuestionnaireResponses,
  useUpdateQuestionnaireResponse,
} from "../features/questionnaire-viewer";
import { DashboardView } from "../features/questionnaire-viewer/components/dashboard";
import { OfflineIndicator } from "../features/examination/components/OfflineIndicator";

export const Route = createFileRoute("/cases_/$id/anamnesis/review")({
  component: AnamnesisReviewPage,
});

function AnamnesisReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: responses, isLoading } = useQuestionnaireResponses(id);
  const updateMutation = useUpdateQuestionnaireResponse(id);

  // True iff any anamnesis save for THIS patient is in flight (or queued
  // behind another via scope.id). Matches both manual-score and
  // questionnaire-response mutations — both share the same patientRecordId
  // in position [1] of their mutationKey.
  const isAnamnesisMutating = useCallback(() => {
    return (
      queryClient.isMutating({
        predicate: (m) => {
          const key = m.options.mutationKey;
          if (!Array.isArray(key) || key[1] !== id) return false;
          return key[0] === "manual-score" || key[0] === "questionnaire-response";
        },
      }) > 0
    );
  }, [queryClient, id]);

  // Block SPA navigation while any anamnesis save is in flight. We give
  // pending mutations a short window to settle so the common case (user
  // navigates immediately after an edit) just waits briefly and proceeds.
  // If they don't settle, the "unsaved changes" dialog appears.
  const shouldBlockFn = useCallback(async () => {
    if (!isAnamnesisMutating()) return false;
    const deadline = Date.now() + 10000;
    while (isAnamnesisMutating() && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return isAnamnesisMutating();
  }, [isAnamnesisMutating]);

  const enableBeforeUnload = useCallback(
    () => isAnamnesisMutating(),
    [isAnamnesisMutating],
  );

  const blocker = useBlocker({ shouldBlockFn, enableBeforeUnload, withResolver: true });

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

  const handleStartReview = () => {
    navigate({ to: "/cases/$id/anamnesis/wizard", params: { id } });
  };

  const handleContinueToExamination = () => {
    navigate({ to: "/cases/$id/examination", params: { id } });
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
    <>
      <div className="flex justify-end mb-2">
        <OfflineIndicator />
      </div>

      <DashboardView
        responses={responses ?? []}
        patientRecordId={id}
        onStartReview={handleStartReview}
        onSkipReview={sqResponse ? handleSkipReview : undefined}
        isSkippingReview={updateMutation.isPending}
        onContinueToExamination={handleContinueToExamination}
        caseId={id}
      />

      {/* Blocker dialog — shown only when in-flight mutations didn't settle. */}
      <AlertDialog open={blocker.status === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ungespeicherte Änderungen</AlertDialogTitle>
            <AlertDialogDescription>
              Die Änderungen konnten nicht gespeichert werden. Möchten Sie ohne Speichern
              fortfahren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Abbrechen</AlertDialogCancel>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>
              Ohne Speichern fortfahren
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
