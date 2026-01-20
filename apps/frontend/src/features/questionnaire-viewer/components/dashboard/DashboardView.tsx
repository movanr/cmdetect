/**
 * Dashboard View - Overview of all questionnaires with scores
 * Shows Axis 2 assessments (PHQ-4, OBC, JFLS), SQ status, and Pain Drawing
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PainDrawingData } from "@/features/pain-drawing-evaluation";
import { PainDrawingScoreCard } from "@/features/pain-drawing-evaluation";
import { ExportButton, type DecryptedPatientData } from "@/features/pdf-export";
import { QUESTIONNAIRE_ID, isQuestionnaireEnabled, type SQAnswers } from "@cmdetect/questionnaires";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import { Axis2ScoreCard } from "./Axis2ScoreCard";
import { SQStatusCard } from "./SQStatusCard";

interface DashboardViewProps {
  /** Questionnaire responses */
  responses: QuestionnaireResponse[];
  /** Callback when starting patient review */
  onStartReview: () => void;
  /** Patient record / case ID (for PDF export) */
  caseId?: string;
  /** Decrypted patient data (for PDF export) */
  patientData?: DecryptedPatientData | null;
  /** Organization name (for PDF export) */
  organizationName?: string;
}

export function DashboardView({
  responses,
  onStartReview,
  caseId,
  patientData,
  organizationName,
}: DashboardViewProps) {
  // Find specific questionnaire responses
  const sqResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);
  const painDrawingResponse = responses.find(
    (r) => r.questionnaireId === QUESTIONNAIRE_ID.PAIN_DRAWING
  );
  const phq4Response = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.PHQ4);
  const gcps1mResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.GCPS_1M);
  const jfls8Response = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS8);
  const jfls20Response = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS20);
  const obcResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.OBC);

  // Extract pain drawing data from response
  const painDrawingData = painDrawingResponse?.answers as PainDrawingData | undefined;

  // Check if SQ screening is negative (all screening questions answered "no")
  // Screening questions: SQ1 (pain), SQ5 (headache), SQ8 (joint noises), SQ9 (closed locking), SQ13 (open locking)
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
  const nextStepLabel = isReviewed ? "Erneut mit Patient bestätigen" : "Mit Patient bestätigen";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Fragebögen-Übersicht</CardTitle>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* PDF Export button */}
          {caseId && (
            <ExportButton
              caseId={caseId}
              patientData={patientData ?? null}
              responses={responses}
              organizationName={organizationName}
            />
          )}
          {/* Top navigation button */}
          {showNextStepButton && (
            <Button onClick={onStartReview}>
              {nextStepLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Negative Screening Banner */}
        {isScreeningNegative && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">Screening negativ</AlertTitle>
            <AlertDescription className="text-green-700">
              Der Patient hat alle Screening-Fragen mit "Nein" beantwortet. Es liegen keine Hinweise
              auf eine CMD vor. Weitere Fragebögen wurden übersprungen.
            </AlertDescription>
          </Alert>
        )}

        {/* SQ Section - Symptom Questionnaire */}
        {isQuestionnaireEnabled(QUESTIONNAIRE_ID.SQ) && (
          <section>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Achse 1 - Symptomfragebogen
            </h3>
            <SQStatusCard response={sqResponse} isScreeningNegative={isScreeningNegative} />
          </section>
        )}

        {/* Axis 2 Section - Psychosocial Assessment */}
        <section>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Achse 2 - Psychosoziale Bewertung
          </h3>
          <div className="grid gap-4 md:grid-cols-2 items-start">
            {/* Pain Drawing Card */}
            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PAIN_DRAWING) && (
              <PainDrawingScoreCard data={painDrawingData ?? null} />
            )}

            {/* GCPS-1M Card */}
            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.GCPS_1M) && (
              <Axis2ScoreCard
                questionnaireId={QUESTIONNAIRE_ID.GCPS_1M}
                title="GCPS - Graduierung chronischer Schmerzen"
                subtitle="1-Monats-Version"
                answers={
                  gcps1mResponse
                    ? (gcps1mResponse.answers as Record<string, string | number>)
                    : null
                }
              />
            )}

            {/* JFLS-8 Card */}
            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS8) && (
              <Axis2ScoreCard
                questionnaireId={QUESTIONNAIRE_ID.JFLS8}
                title="JFLS-8 - Kieferfunktions-Einschränkungsskala"
                answers={jfls8Response ? (jfls8Response.answers as Record<string, string>) : null}
              />
            )}

            {/* PHQ-4 Card */}
            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PHQ4) && (
              <Axis2ScoreCard
                questionnaireId={QUESTIONNAIRE_ID.PHQ4}
                title="PHQ-4 - Gesundheitsfragebogen für Patienten"
                subtitle="Depression & Angst"
                answers={phq4Response ? (phq4Response.answers as Record<string, string>) : null}
              />
            )}

            {/* OBC Card */}
            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.OBC) && (
              <Axis2ScoreCard
                questionnaireId={QUESTIONNAIRE_ID.OBC}
                title="OBC - Oral Behaviors Checklist"
                subtitle="Orale Parafunktionen"
                answers={obcResponse ? (obcResponse.answers as Record<string, string>) : null}
              />
            )}

            {/* JFLS-20 Card */}
            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS20) && (
              <Axis2ScoreCard
                questionnaireId={QUESTIONNAIRE_ID.JFLS20}
                title="JFLS-20 - Kieferfunktions-Einschränkungsskala (erweitert)"
                answers={jfls20Response ? (jfls20Response.answers as Record<string, string>) : null}
              />
            )}
          </div>
        </section>

        {/* Bottom navigation */}
        {showNextStepButton && (
          <div className="flex justify-end pt-2 border-t">
            <Button onClick={onStartReview}>
              {nextStepLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
