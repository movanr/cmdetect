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
import { createFileRoute, useBlocker, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import {
  useQuestionnaireResponses,
  useUpdateQuestionnaireResponse,
} from "../features/questionnaire-viewer";
import { DashboardView } from "../features/questionnaire-viewer/components/dashboard";
import {
  ManualScoreFlushProvider,
  useManualScoreFlushController,
} from "../features/questionnaire-viewer/hooks/ManualScoreFlushContext";

export const Route = createFileRoute("/cases_/$id/anamnesis/review")({
  component: AnamnesisReviewPage,
});

function AnamnesisReviewPage() {
  return (
    <ManualScoreFlushProvider>
      <AnamnesisReviewContent />
    </ManualScoreFlushProvider>
  );
}

function AnamnesisReviewContent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const flushController = useManualScoreFlushController();

  const { data: responses, isLoading } = useQuestionnaireResponses(id);
  const updateMutation = useUpdateQuestionnaireResponse(id);

  // Block SPA navigation when manual-score saves are pending: try to flush,
  // fall back to a "discard or cancel" dialog only if the save fails.
  // enableBeforeUnload returns true whenever there are pending edits so the
  // browser's native warning fires on reload/close.
  const shouldBlockFn = useCallback(async () => {
    if (!flushController?.hasAnyPending()) return false;
    try {
      await flushController.flushAll();
      return false;
    } catch {
      return true;
    }
  }, [flushController]);
  const enableBeforeUnload = useCallback(
    () => flushController?.hasAnyPending() ?? false,
    [flushController]
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
      <DashboardView
        responses={responses ?? []}
        patientRecordId={id}
        onStartReview={handleStartReview}
        onSkipReview={sqResponse ? handleSkipReview : undefined}
        isSkippingReview={updateMutation.isPending}
        onContinueToExamination={handleContinueToExamination}
        caseId={id}
      />

      {/* Blocker dialog — shown only when flush-before-navigate failed. */}
      <AlertDialog open={blocker.status === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ungespeicherte Änderungen</AlertDialogTitle>
            <AlertDialogDescription>
              Die manuell eingegebenen Scores konnten nicht gespeichert werden. Möchten Sie ohne
              Speichern fortfahren?
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
