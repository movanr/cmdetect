/**
 * Axis 2 Score Card - Displays PHQ-4 score with visual severity scale
 * Used in the dashboard for quick severity assessment before patient review
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  calculatePHQ4Score,
  getPHQ4Interpretation,
  getSubscaleInterpretation,
} from "@cmdetect/questionnaires";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { PHQ4Summary } from "../PHQ4Summary";

// Clinical cutoff threshold per Löwe et al. (2010)
const PHQ4_CLINICAL_CUTOFF = 6;

// Severity scale segments
const SEVERITY_SEGMENTS = [
  { label: "Normal", range: "0-2", min: 0, max: 2, color: "bg-green-500" },
  { label: "Mild", range: "3-5", min: 3, max: 5, color: "bg-yellow-500" },
  { label: "Moderat", range: "6-8", min: 6, max: 8, color: "bg-orange-500" },
  { label: "Schwer", range: "9-12", min: 9, max: 12, color: "bg-red-500" },
] as const;

interface Axis2ScoreCardProps {
  questionnaireId: string;
  title: string;
  /** Short description of what the questionnaire measures (e.g., "Depression & Angst") */
  subtitle?: string;
  answers: Record<string, string> | null;
  isPlaceholder?: boolean;
}

/**
 * Calculates the position percentage of the score marker on the scale
 */
function getScorePosition(score: number): number {
  // Scale is 0-12, map to 0-100%
  return Math.min(100, Math.max(0, (score / 12) * 100));
}

/**
 * Gets the active segment index for a given score
 */
function getActiveSegment(score: number): number {
  if (score <= 2) return 0;
  if (score <= 5) return 1;
  if (score <= 8) return 2;
  return 3;
}

export function Axis2ScoreCard({
  questionnaireId,
  title,
  subtitle,
  answers,
  isPlaceholder = false,
}: Axis2ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Placeholder card for future questionnaires (OBC, JFLS)
  if (isPlaceholder || !answers) {
    return (
      <Card className="bg-muted/30">
        <CardHeader className="p-4">
          <div>
            <h4 className="font-medium text-muted-foreground">{title}</h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {isPlaceholder ? "Demnächst verfügbar" : "Keine Daten"}
            </p>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Only PHQ-4 scoring is implemented
  if (questionnaireId !== "phq-4") {
    return (
      <Card>
        <CardHeader className="p-4">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">Bewertung nicht verfügbar</p>
        </CardHeader>
      </Card>
    );
  }

  const score = calculatePHQ4Score(answers);
  const interpretation = getPHQ4Interpretation(score);
  const anxietyResult = getSubscaleInterpretation(score.anxiety);
  const depressionResult = getSubscaleInterpretation(score.depression);
  const activeSegment = getActiveSegment(score.total);
  const scorePosition = getScorePosition(score.total);
  const isClinicallyRelevant = score.total >= PHQ4_CLINICAL_CUTOFF;

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <CardHeader className="p-4">
        {/* Header with title, subtitle and expand button */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-medium">{title}</h4>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground"
          >
            {isExpanded ? (
              <>
                Ausblenden <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Details <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Severity label */}
        <p className="text-sm text-muted-foreground mb-2">Schweregrad </p>

        {/* Severity scale */}
        <div className="relative">
          {/* Scale bar with segments */}
          <div className="flex h-8 rounded-md overflow-hidden">
            {SEVERITY_SEGMENTS.map((segment, index) => (
              <div
                key={segment.label}
                className={`flex-1 ${segment.color} ${
                  index === activeSegment ? "ring-2 ring-inset ring-black/20" : "opacity-70"
                } flex flex-col items-center justify-center`}
              >
                <span className="text-[10px] font-medium text-white/90">{segment.range}</span>
              </div>
            ))}
          </div>

          {/* Cutoff line at 6 (50% position) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-black/60"
            style={{ left: "50%" }}
            title="Klinischer Cutoff (≥6)"
          />

          {/* Score marker */}
          <div
            className="absolute -bottom-3 transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${scorePosition}%` }}
          >
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-foreground" />
          </div>
        </div>

        {/* Labels under scale */}
        <div className="flex mt-4 text-[10px] text-muted-foreground">
          {SEVERITY_SEGMENTS.map((segment) => (
            <div key={segment.label} className="flex-1 text-center">
              {segment.label}
            </div>
          ))}
        </div>

        {/* Score display */}
        <div className="flex items-center justify-center mt-3">
          <span className="text-2xl font-bold">{score.total}</span>
          <span className="text-lg text-muted-foreground ml-1">/ {score.maxTotal}</span>
          <span className="ml-3 text-sm font-medium">{interpretation.text}</span>
        </div>

        {/* Clinical relevance alert */}
        {isClinicallyRelevant && (
          <div className="flex items-center justify-center gap-1.5 mt-2 text-orange-600">
            <AlertTriangle className="size-4" />
            <span className="text-sm font-medium">Klinisch auffällig (≥6 Punkte)</span>
          </div>
        )}

        {/* Subscales */}
        <div className="flex justify-center gap-6 mt-4 pt-3 border-t text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Angst:</span>
            <span className={anxietyResult.positive ? "text-orange-600 font-medium" : ""}>
              {score.anxiety}/{score.maxAnxiety}
            </span>
            {anxietyResult.positive && <span className="text-[10px] text-orange-600">(≥3)</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Depression:</span>
            <span className={depressionResult.positive ? "text-orange-600 font-medium" : ""}>
              {score.depression}/{score.maxDepression}
            </span>
            {depressionResult.positive && <span className="text-[10px] text-orange-600">(≥3)</span>}
          </div>
        </div>
      </CardHeader>

      {/* Expandable details */}
      {isExpanded && (
        <CardContent className="border-t bg-muted/20 p-4">
          <PHQ4Summary answers={answers} />
        </CardContent>
      )}
    </Card>
  );
}
