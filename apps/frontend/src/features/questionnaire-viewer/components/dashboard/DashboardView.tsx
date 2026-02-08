/**
 * Dashboard View - Overview of all questionnaires with scores
 * Supports two layouts: "tables" (clean tables) and "cards" (compact score cards)
 * Layout preference is persisted in localStorage.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { ImageId, PainDrawingData } from "@/features/pain-drawing-evaluation";
import {
  calculatePainDrawingScore,
  IMAGE_CONFIGS,
  PainDrawingScoreCard,
  ReadOnlyCanvas,
  REGION_ORDER,
} from "@/features/pain-drawing-evaluation";
import { useBackgroundPrint } from "@/hooks/use-background-print";
import type {
  GCPS1MAnswers,
  JFLS20Answers,
  JFLS8Answers,
  OBCAnswers,
  SQAnswers,
} from "@cmdetect/questionnaires";
import { isQuestionnaireEnabled, QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutList,
  Printer,
  Rows3,
} from "lucide-react";
import { useState } from "react";
import { AXIS1_INFO, AXIS2_INFO } from "../../content/dashboard-instructions";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import { Axis2ScoreCard } from "./Axis2ScoreCard";
import { DashboardInfoBlock } from "./DashboardInfoBlock";
import {
  GCPSAnswersTable,
  JFLS20AnswersTable,
  JFLS8AnswersTable,
  OBCAnswersTable,
  PainDrawingDetail,
  PHQ4AnswersTable,
  ScoresOverviewTable,
  SQAnswersTable,
} from "./questionnaire-tables";
import { SQStatusCard } from "./SQStatusCard";

// ─── Layout toggle ─────────────────────────────────────────────────────

type DashboardLayout = "tables" | "cards";

const LAYOUT_STORAGE_KEY = "cmdetect:dashboard-layout";

function getStoredLayout(): DashboardLayout {
  try {
    const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (stored === "tables" || stored === "cards") return stored;
  } catch {
    /* ignore */
  }
  return "tables";
}

function storeLayout(layout: DashboardLayout) {
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
  } catch {
    /* ignore */
  }
}

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
  const [layout, setLayout] = useState<DashboardLayout>(getStoredLayout);
  const [selectedRegion, setSelectedRegion] = useState<ImageId | null>(null);
  const { print, isPrinting } = useBackgroundPrint();

  const toggleLayout = () => {
    const next = layout === "tables" ? "cards" : "tables";
    setLayout(next);
    storeLayout(next);
  };

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
  const hasPainDrawing =
    painDrawingData?.drawings && Object.keys(painDrawingData.drawings).length > 0;

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

  const hasAnswers = (r: QuestionnaireResponse | undefined) =>
    r && Object.keys(r.answers).length > 0;

  // Pain drawing score (for modal element count display)
  const painDrawingScore =
    hasPainDrawing && painDrawingData ? calculatePainDrawingScore(painDrawingData) : null;

  // Determine if we should show the next step button
  const showNextStepButton = sqResponse && !isScreeningNegative;
  const isReviewed = !!sqResponse?.reviewedAt;

  // Format timestamp for display
  const formatTimestamp = (ts: string | null | undefined) => {
    if (!ts) return null;
    return new Date(ts).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Shared screening banner
  const screeningBanner = isScreeningNegative && (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle2 className="h-5 w-5 text-green-600" />
      <AlertTitle className="text-green-800">Screening negativ</AlertTitle>
      <AlertDescription className="text-green-700">
        Der Patient hat alle Screening-Fragen mit "Nein" beantwortet. Es liegen keine Hinweise auf
        eine CMD vor. Weitere Fragebögen wurden übersprungen.
      </AlertDescription>
    </Alert>
  );

  // Shared bottom navigation
  const bottomNav = showNextStepButton && (
    <div className="flex justify-end gap-2 pt-2 border-t">
      {isReviewed ? (
        <>
          <Button variant="outline" onClick={onStartReview}>
            Erneut überprüfen
          </Button>
          {onContinueToExamination && (
            <Button onClick={onContinueToExamination}>
              Weiter zur Untersuchung
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <Button onClick={onStartReview}>
          SF mit Patient überprüfen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Fragebögen-Übersicht</CardTitle>
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Layout toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLayout}
              className="text-muted-foreground h-8 px-2"
              title={layout === "tables" ? "Kompakte Ansicht" : "Tabellenansicht"}
            >
              {layout === "tables" ? (
                <Rows3 className="h-4 w-4" />
              ) : (
                <LayoutList className="h-4 w-4" />
              )}
            </Button>
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
                  <Button variant="outline" onClick={onStartReview}>
                    Erneut überprüfen
                  </Button>
                  {onContinueToExamination && (
                    <Button onClick={onContinueToExamination}>
                      Weiter zur Untersuchung
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={onStartReview}>
                  SF mit Patient überprüfen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ))}
          </div>
        </CardHeader>

        {/* ── Table layout ── */}
        {layout === "tables" && (
          <CardContent className="space-y-8">
            {screeningBanner}

            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Ergebnisübersicht
              </h3>
              <ScoresOverviewTable responses={responses} showSeverityColors />
            </section>

            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.SQ) && sqResponse && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Symptomfragebogen (SF)
                  {isScreeningNegative && " — Screening negativ"}
                  {!isScreeningNegative && sqResponse.reviewedAt && " — Überprüft"}
                </h3>
                <DashboardInfoBlock info={AXIS1_INFO} className="mb-3" />
                <p className="text-xs text-gray-400 mb-2">
                  {sqResponse.submittedAt && (
                    <span>Eingereicht: {formatTimestamp(sqResponse.submittedAt)}</span>
                  )}
                  {sqResponse.reviewedAt && (
                    <span className="ml-3">
                      Überprüft: {formatTimestamp(sqResponse.reviewedAt)}
                    </span>
                  )}
                </p>
                <SQAnswersTable answers={sqResponse.answers} />
              </section>
            )}

            {/* Axis 2 info block — shown if any Axis 2 instrument has data */}
            {(hasPainDrawing ||
              hasAnswers(gcps1mResponse) ||
              hasAnswers(phq4Response) ||
              hasAnswers(jfls8Response) ||
              hasAnswers(obcResponse) ||
              hasAnswers(jfls20Response)) && (
              <DashboardInfoBlock info={AXIS2_INFO} className="mt-2" />
            )}

            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PAIN_DRAWING) &&
              hasPainDrawing &&
              painDrawingData && (
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Schmerzzeichnung
                  </h3>
                  <PainDrawingDetail
                    data={painDrawingData}
                    onRegionClick={(regionId) => setSelectedRegion(regionId as ImageId)}
                  />
                </section>
              )}

            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.GCPS_1M) && hasAnswers(gcps1mResponse) && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  GCPS-1M — Graduierung chronischer Schmerzen
                </h3>
                <GCPSAnswersTable answers={gcps1mResponse!.answers as GCPS1MAnswers} showPips />
              </section>
            )}

            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PHQ4) && hasAnswers(phq4Response) && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  PHQ-4 — Depression &amp; Angst
                </h3>
                <PHQ4AnswersTable
                  answers={phq4Response!.answers as Record<string, string>}
                  showPips
                />
              </section>
            )}

            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS8) && hasAnswers(jfls8Response) && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  JFLS-8 — Kieferfunktions-Einschränkungsskala
                </h3>
                <JFLS8AnswersTable answers={jfls8Response!.answers as JFLS8Answers} showPips />
              </section>
            )}

            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.OBC) && hasAnswers(obcResponse) && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  OBC — Oral Behaviors Checklist
                </h3>
                <OBCAnswersTable answers={obcResponse!.answers as OBCAnswers} showPips />
              </section>
            )}

            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS20) && hasAnswers(jfls20Response) && (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  JFLS-20 — Kieferfunktions-Einschränkungsskala (erweitert)
                </h3>
                <JFLS20AnswersTable answers={jfls20Response!.answers as JFLS20Answers} showPips />
              </section>
            )}

            {bottomNav}
          </CardContent>
        )}

        {/* ── Card layout (compact score cards) ── */}
        {layout === "cards" && (
          <CardContent className="space-y-6">
            {screeningBanner}

            {/* SQ Section */}
            {isQuestionnaireEnabled(QUESTIONNAIRE_ID.SQ) && (
              <section>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Achse 1 - Symptomfragebogen
                </h3>
                <DashboardInfoBlock info={AXIS1_INFO} className="mb-3" />
                <SQStatusCard response={sqResponse} isScreeningNegative={isScreeningNegative} />
              </section>
            )}

            {/* Axis 2 Section */}
            <section>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Achse 2 - Psychosoziale Bewertung
              </h3>
              <DashboardInfoBlock info={AXIS2_INFO} className="mb-3" />
              <div className="space-y-3">
                {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PAIN_DRAWING) && (
                  <PainDrawingScoreCard data={painDrawingData ?? null} />
                )}

                {isQuestionnaireEnabled(QUESTIONNAIRE_ID.GCPS_1M) && (
                  <Axis2ScoreCard
                    questionnaireId={QUESTIONNAIRE_ID.GCPS_1M}
                    title="GCPS - Graduierung chronischer Schmerzen"
                    subtitle="30-Tage-Version"
                    answers={
                      gcps1mResponse
                        ? (gcps1mResponse.answers as Record<string, string | number>)
                        : null
                    }
                  />
                )}

                {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS8) && (
                  <Axis2ScoreCard
                    questionnaireId={QUESTIONNAIRE_ID.JFLS8}
                    title="JFLS-8 - Kieferfunktions-Einschränkungsskala"
                    answers={
                      jfls8Response ? (jfls8Response.answers as Record<string, string>) : null
                    }
                  />
                )}

                {isQuestionnaireEnabled(QUESTIONNAIRE_ID.PHQ4) && (
                  <Axis2ScoreCard
                    questionnaireId={QUESTIONNAIRE_ID.PHQ4}
                    title="PHQ-4 - Gesundheitsfragebogen für Patienten"
                    subtitle="Depression & Angst"
                    answers={phq4Response ? (phq4Response.answers as Record<string, string>) : null}
                  />
                )}

                {isQuestionnaireEnabled(QUESTIONNAIRE_ID.OBC) && (
                  <Axis2ScoreCard
                    questionnaireId={QUESTIONNAIRE_ID.OBC}
                    title="OBC - Oral Behaviors Checklist"
                    subtitle="Orale Parafunktionen"
                    answers={obcResponse ? (obcResponse.answers as Record<string, string>) : null}
                  />
                )}

                {isQuestionnaireEnabled(QUESTIONNAIRE_ID.JFLS20) && (
                  <Axis2ScoreCard
                    questionnaireId={QUESTIONNAIRE_ID.JFLS20}
                    title="JFLS-20 - Kieferfunktions-Einschränkungsskala (erweitert)"
                    answers={
                      jfls20Response ? (jfls20Response.answers as Record<string, string>) : null
                    }
                  />
                )}
              </div>
            </section>

            {bottomNav}
          </CardContent>
        )}
      </Card>

      {/* Pain Drawing Region Modal (tables layout only) */}
      {layout === "tables" && hasPainDrawing && painDrawingData && painDrawingScore && (
        <Dialog open={!!selectedRegion} onOpenChange={(open) => !open && setSelectedRegion(null)}>
          <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-8">
                <span>{selectedRegion ? IMAGE_CONFIGS[selectedRegion].label : ""}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedRegion ? REGION_ORDER.indexOf(selectedRegion) + 1 : 0} /{" "}
                  {REGION_ORDER.length}
                </span>
              </DialogTitle>
            </DialogHeader>
            {selectedRegion && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 w-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const currentIndex = REGION_ORDER.indexOf(selectedRegion);
                      const prevIndex =
                        (currentIndex - 1 + REGION_ORDER.length) % REGION_ORDER.length;
                      setSelectedRegion(REGION_ORDER[prevIndex]);
                    }}
                    className="shrink-0"
                  >
                    <ChevronLeft className="size-5" />
                  </Button>

                  <div className="flex-1 flex justify-center">
                    <ReadOnlyCanvas
                      imageConfig={IMAGE_CONFIGS[selectedRegion]}
                      elements={painDrawingData.drawings[selectedRegion]?.elements ?? []}
                      maxWidth={400}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const currentIndex = REGION_ORDER.indexOf(selectedRegion);
                      const nextIndex = (currentIndex + 1) % REGION_ORDER.length;
                      setSelectedRegion(REGION_ORDER[nextIndex]);
                    }}
                    className="shrink-0"
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-3">
                  {painDrawingScore.elementCounts[selectedRegion].total} Markierung
                  {painDrawingScore.elementCounts[selectedRegion].total !== 1 ? "en" : ""}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
