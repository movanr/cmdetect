/**
 * Anamnesis Wizard Route
 *
 * SQ wizard view for reviewing symptom questionnaire with patient.
 * Second sub-step of the Anamnesis workflow.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuestionnaireResponses, SQWizardView } from "../features/questionnaire-viewer";

export const Route = createFileRoute("/cases_/$id/anamnesis/wizard")({
  component: AnamnesisWizardPage,
});

function AnamnesisWizardPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Fetch questionnaire responses
  const { data: responses, isLoading } = useQuestionnaireResponses(id);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find SQ response for wizard
  const sqResponse = responses?.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);

  // No SQ response available
  if (!sqResponse) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={ClipboardList}
            title="Kein Symptomfragebogen vorhanden"
            description="Der Patient hat den Symptomfragebogen noch nicht ausgefüllt."
          />
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/cases/$id/anamnesis/review", params: { id } })}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Übersicht
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Navigate to examination after completion
  const handleComplete = () => {
    navigate({
      to: "/cases/$id/examination",
      params: { id },
    });
  };

  // Navigate back to review on cancel
  const handleCancel = () => {
    navigate({
      to: "/cases/$id/anamnesis/review",
      params: { id },
    });
  };

  return (
    <SQWizardView
      response={sqResponse}
      patientRecordId={id}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
