/**
 * Axis 2 Score Card - Displays questionnaire answers with pip scales
 * Used in the dashboard for reviewing individual questionnaire responses
 */

import { Card } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import type {
  GCPS1MAnswers,
  JFLS20Answers,
  JFLS8Answers,
  OBCAnswers,
} from "@cmdetect/questionnaires";
import {
  calculateJFLS20Score,
  calculateJFLS8Score,
  calculatePHQ4Score,
  getSubscaleInterpretation,
  QUESTIONNAIRE_ID,
} from "@cmdetect/questionnaires";
import { BookOpen } from "lucide-react";
import { SCORING_MANUAL_ANCHORS } from "../../content/dashboard-instructions";
import {
  GCPSAnswersTable,
  JFLS20AnswersTable,
  JFLS8AnswersTable,
  OBCAnswersTable,
  PHQ4AnswersTable,
} from "./questionnaire-tables";

interface Axis2ScoreCardProps {
  questionnaireId: string;
  title: string;
  /** Short description of what the questionnaire measures (e.g., "Depression & Angst") */
  subtitle?: string;
  answers: Record<string, string | number> | null;
  isPlaceholder?: boolean;
}

/**
 * Inner card layout: header with title/subtitle/manual link, then answer table body
 */
function ScoreCardLayout({
  title,
  subtitle,
  manualAnchor,
  children,
}: {
  title: string;
  subtitle?: string;
  manualAnchor?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="p-4 pb-2 flex items-start justify-between">
        <div>
          <h4 className="font-medium text-sm leading-tight">{title}</h4>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {manualAnchor && (
          <Link
            to="/docs/scoring-manual"
            hash={manualAnchor}
            onClick={() => sessionStorage.setItem("docs-return-url", window.location.pathname)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline shrink-0 ml-3"
          >
            <BookOpen className="h-3 w-3" />
            Scoring-Anleitung
          </Link>
        )}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </Card>
  );
}

export function Axis2ScoreCard({
  questionnaireId,
  title,
  subtitle,
  answers,
  isPlaceholder = false,
}: Axis2ScoreCardProps) {
  const manualAnchor = SCORING_MANUAL_ANCHORS[questionnaireId];

  // Check if answers is empty (null, undefined, or empty object)
  const hasData = answers && Object.keys(answers).length > 0;

  // Placeholder card for future questionnaires or empty submissions (SQ screening negative)
  if (isPlaceholder || !hasData) {
    return (
      <Card className="bg-muted/30">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_minmax(250px,2fr)_minmax(150px,1fr)] gap-x-6 gap-y-4 items-center">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
            <div />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">
                {isPlaceholder ? "Demnächst verfügbar" : "Keine Daten"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // GCPS-1M
  if (questionnaireId === QUESTIONNAIRE_ID.GCPS_1M) {
    return (
      <ScoreCardLayout title={title} subtitle={subtitle} manualAnchor={manualAnchor}>
        <GCPSAnswersTable answers={answers as GCPS1MAnswers} showPips />
      </ScoreCardLayout>
    );
  }

  // JFLS-8
  if (questionnaireId === QUESTIONNAIRE_ID.JFLS8) {
    const jflsScore = calculateJFLS8Score(answers as JFLS8Answers);
    return (
      <ScoreCardLayout title={title} subtitle={subtitle} manualAnchor={manualAnchor}>
        {!jflsScore.isValid && (
          <p className="text-xs text-muted-foreground mb-2">
            Zu viele fehlende Antworten ({jflsScore.missingCount}/8)
          </p>
        )}
        <JFLS8AnswersTable answers={answers as JFLS8Answers} showPips />
      </ScoreCardLayout>
    );
  }

  // JFLS-20
  if (questionnaireId === QUESTIONNAIRE_ID.JFLS20) {
    const jflsScore = calculateJFLS20Score(answers as JFLS20Answers);
    return (
      <ScoreCardLayout title={title} subtitle={subtitle} manualAnchor={manualAnchor}>
        {!jflsScore.isValid && (
          <p className="text-xs text-muted-foreground mb-2">
            Zu viele fehlende Antworten ({jflsScore.missingCount}/20)
          </p>
        )}
        <JFLS20AnswersTable answers={answers as JFLS20Answers} showPips />
      </ScoreCardLayout>
    );
  }

  // OBC
  if (questionnaireId === QUESTIONNAIRE_ID.OBC) {
    return (
      <ScoreCardLayout title={title} subtitle={subtitle} manualAnchor={manualAnchor}>
        <OBCAnswersTable answers={answers as OBCAnswers} showPips />
      </ScoreCardLayout>
    );
  }

  // Unknown questionnaire (not PHQ-4)
  if (questionnaireId !== QUESTIONNAIRE_ID.PHQ4) {
    return (
      <Card>
        <div className="p-4">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">Bewertung nicht verfügbar</p>
        </div>
      </Card>
    );
  }

  // PHQ-4
  const score = calculatePHQ4Score(answers as Record<string, string>);
  const anxietyResult = getSubscaleInterpretation(score.anxiety);
  const depressionResult = getSubscaleInterpretation(score.depression);

  return (
    <ScoreCardLayout title={title} subtitle={subtitle} manualAnchor={manualAnchor}>
      {(anxietyResult.positive || depressionResult.positive) && (
        <p className="text-xs text-muted-foreground mb-2">
          {anxietyResult.positive && (
            <span className="text-orange-600 font-medium mr-3">Angst ≥3</span>
          )}
          {depressionResult.positive && (
            <span className="text-orange-600 font-medium">Depression ≥3</span>
          )}
        </p>
      )}
      <PHQ4AnswersTable answers={answers as Record<string, string>} showPips />
    </ScoreCardLayout>
  );
}
