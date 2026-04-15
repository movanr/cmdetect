/**
 * Dashboard View - Overview of all questionnaires with scores
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PainDrawingData } from "@/features/pain-drawing-evaluation";
import { PainDrawingScoreCard } from "@/features/pain-drawing-evaluation";
import { useBackgroundPrint } from "@/hooks/use-background-print";
import type { SQAnswers } from "@cmdetect/questionnaires";
import { isQuestionnaireEnabled, QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import { ArrowRight, CheckCircle2, ClipboardList, Printer } from "lucide-react";
import { AXIS1_INFO, AXIS2_INFO } from "../../content/dashboard-instructions";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import { Axis2TabbedView } from "./Axis2TabbedView";
import { DashboardInfoBlock } from "./DashboardInfoBlock";
import { SQStatusCard } from "./SQStatusCard";

// ─── Main component ────────────────────────────────────────────────────

interface DashboardViewProps {
  /** Questionnaire responses */
  responses: QuestionnaireResponse[];
  /** Callback when starting patient review */
  onStartReview: () => void;
  /** Callback to continue to the examination (shown after review is complete) */
  onContinueToExamination?: () => void;
  /** Patient record / case ID (for print export) */
  caseId?: string;
}

export function DashboardView({
  responses,
  onStartReview,
  onContinueToExamination,
  caseId,
}: DashboardViewProps) {
  const { print, isPrinting } = useBackgroundPrint();

  // Find specific questionnaire responses
  const sqResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);
  const painDrawingResponse = responses.find(
    (r) => r.questionnaireId === QUESTIONNAIRE_ID.PAIN_DRAWING
  );

  // Extract pain drawing data from response
  const painDrawingData = painDrawingResponse?.answers as PainDrawingData | undefined;

  // Check if SQ screening is negative
  const sqAnswers = sqResponse?.answers as SQAnswers | undefined;
  const isScreeningNegative = sqAnswers
    ? sqAnswers.SQ1 === "no" &&
      sqAnswers.SQ5 === "no" &&
      sqAnswers.SQ8 === "no" &&
      sqAnswers.SQ9 === "no" &&
      sqAnswers.SQ13 === "no"
    : false;

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

  // Determine if we should show the next step button
  const showNextStepButton = sqResponse && !isScreeningNegative;
  const isReviewed = !!sqResponse?.reviewedAt;

  // Shared screening banner
  const screeningBanner = isScreeningNegative && (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle2 className="h-5 w-5 text-green-600" />
      <AlertTitle className="text-green-800">Screening negativ</AlertTitle>
      <AlertDescription className="text-green-700">
        Der Patient hat alle Screening-Fragen mit &quot;Nein&quot; beantwortet. Es liegen keine
        Hinweise auf eine CMD vor. Weitere Fragebögen wurden übersprungen.
      </AlertDescription>
    </Alert>
  );

  // Shared bottom navigation
  const bottomNav = showNextStepButton && (
    <div className="flex justify-end gap-2 pt-2 border-t">
      {isReviewed ? (
        <>
          <Button
            variant="outline"
            onClick={onStartReview}
            title="Antworten gemeinsam mit dem Patienten durchgehen und Lokalisationen bestätigen."
          >
            SF erneut überprüfen
          </Button>
          {onContinueToExamination && (
            <Button onClick={onContinueToExamination}>
              Weiter zur Untersuchung
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <Button
          onClick={onStartReview}
          title="Antworten gemeinsam mit dem Patienten durchgehen und Lokalisationen bestätigen."
        >
          SF mit Patient überprüfen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Fragebögen-Übersicht</CardTitle>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Print / PDF export button */}
          {caseId && (
            <Button
              variant="outline"
              onClick={() => print(`/cases/${caseId}/print-anamnesis`)}
              disabled={responses.length === 0 || isPrinting}
            >
              <Printer className="mr-2 h-4 w-4" />
              {isPrinting ? "Wird gedruckt…" : "Drucken / PDF"}
            </Button>
          )}
          {/* Top navigation button(s) */}
          {showNextStepButton &&
            (isReviewed ? (
              <>
                <Button
                  variant="outline"
                  onClick={onStartReview}
                  title="Antworten gemeinsam mit dem Patienten durchgehen und Lokalisationen bestätigen."
                >
                  SF erneut überprüfen
                </Button>
                {onContinueToExamination && (
                  <Button onClick={onContinueToExamination}>
                    Weiter zur Untersuchung
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={onStartReview}
                title="Antworten gemeinsam mit dem Patienten durchgehen und Lokalisationen bestätigen."
              >
                SF mit Patient überprüfen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {screeningBanner}

        {/* SQ Section */}
        {isQuestionnaireEnabled(QUESTIONNAIRE_ID.SQ) && (
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Achse 1 - Symptomfragebogen
            </h3>
            <DashboardInfoBlock info={AXIS1_INFO} className="mb-3" />
            <SQStatusCard
              response={sqResponse}
              isScreeningNegative={isScreeningNegative}
              isReviewed={isReviewed}
            />
          </section>
        )}

        {/* Axis 2 Section */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Achse 2 - Psychosoziale Bewertung
          </h3>
          <DashboardInfoBlock info={AXIS2_INFO} className="mb-3" />
          <div className="space-y-4">
            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PAIN_DRAWING) && (
              <PainDrawingScoreCard data={painDrawingData ?? null} />
            )}

            <Axis2TabbedView responses={responses} />
          </div>
        </section>

        {bottomNav}
      </CardContent>
    </Card>
  );
}
