/**
 * Anamnesis Review Container
 * Main orchestrator for the questionnaire review flow
 * Manages transitions between dashboard and wizard views
 */

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { useQuestionnaireResponses } from "../hooks/useQuestionnaireResponses";
import { DashboardView } from "./dashboard";
import { SQWizardView } from "./wizard";

interface AnamnesisReviewContainerProps {
  patientRecordId: string;
}

type ViewMode = "dashboard" | "wizard";

export function AnamnesisReviewContainer({
  patientRecordId,
}: AnamnesisReviewContainerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const { data, isLoading } = useQuestionnaireResponses(patientRecordId);

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

  const responses = data ?? [];

  // Find SQ response for wizard
  const sqResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);

  // Wizard view
  if (viewMode === "wizard" && sqResponse) {
    return (
      <SQWizardView
        response={sqResponse}
        patientRecordId={patientRecordId}
        onComplete={() => setViewMode("dashboard")}
        onCancel={() => setViewMode("dashboard")}
      />
    );
  }

  // Dashboard view (default)
  return (
    <DashboardView
      responses={responses}
      onStartReview={() => setViewMode("wizard")}
    />
  );
}
