/**
 * Dashboard View - Overview of all questionnaires with scores
 * Shows Axis 2 assessments (PHQ-4, OBC, JFLS) and SQ status
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import { Axis2ScoreCard } from "./Axis2ScoreCard";
import { SQStatusCard } from "./SQStatusCard";

interface DashboardViewProps {
  responses: QuestionnaireResponse[];
  onStartReview: () => void;
}

export function DashboardView({ responses, onStartReview }: DashboardViewProps) {
  // Find specific questionnaire responses
  const sqResponse = responses.find((r) => r.questionnaireId === "dc-tmd-sq");
  const phq4Response = responses.find((r) => r.questionnaireId === "phq-4");

  // Check if there are any responses at all
  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={ClipboardList}
            title="Keine Fragebögen eingereicht"
            description="Der Patient hat noch keine Fragebögen für diesen Fall ausgefüllt."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fragebögen-Übersicht</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SQ Section - Symptom Questionnaire */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Achse 1 - Symptomfragebogen
          </h3>
          <SQStatusCard response={sqResponse} onStartReview={onStartReview} />
        </section>
        {/* Axis 2 Section - Psychosocial Assessment */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Achse 2 - Psychosoziale Bewertung
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* PHQ-4 Card */}
            <Axis2ScoreCard
              questionnaireId="phq-4"
              title="PHQ-4"
              answers={phq4Response ? (phq4Response.answers as Record<string, string>) : null}
            />

            {/* OBC Placeholder */}
            <Axis2ScoreCard questionnaireId="obc" title="OBC" answers={null} isPlaceholder />

            {/* JFLS Placeholder */}
            <Axis2ScoreCard questionnaireId="jfls" title="JFLS" answers={null} isPlaceholder />
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
