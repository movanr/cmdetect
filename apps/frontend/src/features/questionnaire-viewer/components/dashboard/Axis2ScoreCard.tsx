/**
 * Axis 2 Score Card - Displays PHQ-4 score with visual severity scale
 * Used in the dashboard for quick severity assessment before patient review
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type {
  GCPS1MAnswers,
  GCPSGrade,
  JFLS20Answers,
  JFLS20LimitationLevel,
  JFLS20SubscaleScore,
  JFLS8Answers,
  JFLS8LimitationLevel,
  OBCAnswers,
  OBCRiskLevel,
} from "@cmdetect/questionnaires";
import {
  calculateGCPS1MScore,
  calculateJFLS20Score,
  calculateJFLS8Score,
  calculateOBCScore,
  calculatePHQ4Score,
  getPHQ4Interpretation,
  getSubscaleInterpretation,
  JFLS20_REFERENCE_VALUES,
  JFLS20_SUBSCALE_LABELS,
  QUESTIONNAIRE_ID,
} from "@cmdetect/questionnaires";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { GCPS1MSummary } from "../GCPS1MSummary";
import { JFLS20Summary } from "../JFLS20Summary";
import { JFLS8Summary } from "../JFLS8Summary";
import { OBCSummary } from "../OBCSummary";
import { PHQ4Summary } from "../PHQ4Summary";

// Clinical cutoff threshold per Löwe et al. (2010)
const PHQ4_CLINICAL_CUTOFF = 6;

// PHQ-4 Severity scale segments
const PHQ4_SEVERITY_SEGMENTS = [
  { label: "Normal", range: "0-2", min: 0, max: 2, color: "bg-green-500" },
  { label: "Mild", range: "3-5", min: 3, max: 5, color: "bg-yellow-500" },
  { label: "Moderat", range: "6-8", min: 6, max: 8, color: "bg-orange-500" },
  { label: "Schwer", range: "9-12", min: 9, max: 12, color: "bg-red-500" },
] as const;

// GCPS Grade scale segments (0-IV) - German labels per DC/TMD manual
const GCPS_GRADE_SEGMENTS: Array<{
  grade: GCPSGrade;
  label: string;
  sublabel: string;
  color: string;
}> = [
  { grade: 0, label: "0", sublabel: "Kein Schmerz", color: "bg-green-500" },
  { grade: 1, label: "I", sublabel: "Geringe Intensität", color: "bg-yellow-400" },
  { grade: 2, label: "II", sublabel: "Hohe Intensität", color: "bg-yellow-500" },
  { grade: 3, label: "III", sublabel: "Mäßige Einschr.", color: "bg-orange-500" },
  { grade: 4, label: "IV", sublabel: "Hochgradige Einschr.", color: "bg-red-500" },
];

// Charakteristische Schmerzintensität scale segments
const CPI_SEGMENTS = [
  { label: "Keine", range: "0", min: 0, max: 0, color: "bg-green-500" },
  { label: "Gering", range: "1-49", min: 1, max: 49, color: "bg-yellow-500" },
  { label: "Hoch", range: "50-100", min: 50, max: 100, color: "bg-red-500" },
] as const;

// Beeinträchtigungswert scale segments with Beeinträchtigungspunkte (BP)
const INTERFERENCE_SEGMENTS = [
  { bp: 0, range: "0-29", min: 0, max: 29, color: "bg-green-500" },
  { bp: 1, range: "30-49", min: 30, max: 49, color: "bg-yellow-500" },
  { bp: 2, range: "50-69", min: 50, max: 69, color: "bg-orange-500" },
  { bp: 3, range: "70+", min: 70, max: 100, color: "bg-red-500" },
] as const;

// OBC Risk level segments based on TMD prevalence comparison
const OBC_RISK_SEGMENTS: Array<{
  level: OBCRiskLevel;
  label: string;
  sublabel: string;
  range: string;
  min: number;
  max: number;
  color: string;
}> = [
  {
    level: "normal",
    label: "Normal",
    sublabel: "Normale Verhaltensweisen",
    range: "0-16",
    min: 0,
    max: 16,
    color: "bg-green-500",
  },
  {
    level: "elevated",
    label: "Erhöht",
    sublabel: "2× häufiger bei CMD",
    range: "17-24",
    min: 17,
    max: 24,
    color: "bg-yellow-500",
  },
  {
    level: "high",
    label: "Hoch",
    sublabel: "17× häufiger bei CMD",
    range: "25+",
    min: 25,
    max: 84,
    color: "bg-red-500",
  },
];

// JFLS-8 Limitation level segments based on reference values
// Healthy: 0.16, Chronic TMD: 1.74
const JFLS8_LIMITATION_SEGMENTS: Array<{
  level: JFLS8LimitationLevel;
  label: string;
  sublabel: string;
  range: string;
  min: number;
  max: number;
  color: string;
}> = [
  {
    level: "normal",
    label: "Normal",
    sublabel: "Ref: 0.16",
    range: "<0.5",
    min: 0,
    max: 0.5,
    color: "bg-green-500",
  },
  {
    level: "mild",
    label: "Leicht",
    sublabel: "Leichte Einschränkung",
    range: "0.5-1.5",
    min: 0.5,
    max: 1.5,
    color: "bg-yellow-500",
  },
  {
    level: "significant",
    label: "Deutlich",
    sublabel: "Ref TMD: 1.74",
    range: "≥1.5",
    min: 1.5,
    max: 10,
    color: "bg-red-500",
  },
];

// JFLS-20 Limitation level segments (same reference values as JFLS-8)
const JFLS20_LIMITATION_SEGMENTS: Array<{
  level: JFLS20LimitationLevel;
  label: string;
  sublabel: string;
  range: string;
  min: number;
  max: number;
  color: string;
}> = [
  {
    level: "normal",
    label: "Normal",
    sublabel: "Ref: 0.16",
    range: "<0.5",
    min: 0,
    max: 0.5,
    color: "bg-green-500",
  },
  {
    level: "mild",
    label: "Leicht",
    sublabel: "Leichte Einschränkung",
    range: "0.5-1.5",
    min: 0.5,
    max: 1.5,
    color: "bg-yellow-500",
  },
  {
    level: "significant",
    label: "Deutlich",
    sublabel: "Ref TMD: 1.74",
    range: "≥1.5",
    min: 1.5,
    max: 10,
    color: "bg-red-500",
  },
];

interface Axis2ScoreCardProps {
  questionnaireId: string;
  title: string;
  /** Short description of what the questionnaire measures (e.g., "Depression & Angst") */
  subtitle?: string;
  answers: Record<string, string | number> | null;
  isPlaceholder?: boolean;
}

/**
 * Gets the active segment index for a given PHQ-4 score
 */
function getActiveSegment(score: number): number {
  if (score <= 2) return 0;
  if (score <= 5) return 1;
  if (score <= 8) return 2;
  return 3;
}

/**
 * Helper component to display a JFLS-20 subscale score
 */
function JFLS20SubscaleDisplay({
  label,
  subscale,
  refValues,
}: {
  label: string;
  subscale: JFLS20SubscaleScore;
  refValues: { healthy: { mean: number }; chronicTMD: { mean: number } };
}) {
  const isElevated =
    subscale.isValid && subscale.score !== null && subscale.score >= refValues.chronicTMD.mean;

  if (!subscale.isValid) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{label}:</span>
        <span className="text-muted-foreground text-xs">({subscale.missingCount} fehlend)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <span className={isElevated ? "text-red-600 font-medium" : ""}>
        {subscale.score?.toFixed(1)}
      </span>
      {isElevated && (
        <span className="text-[10px] text-red-600">(≥{refValues.chronicTMD.mean.toFixed(1)})</span>
      )}
    </div>
  );
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
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            <p className="text-sm text-muted-foreground mt-2">
              {isPlaceholder ? "Demnächst verfügbar" : "Keine Daten"}
            </p>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // GCPS-1M Scoring
  if (questionnaireId === QUESTIONNAIRE_ID.GCPS_1M) {
    const gcpsScore = calculateGCPS1MScore(answers as GCPS1MAnswers);
    const activeGradeIndex = gcpsScore.grade;

    // Get active segment index for CPI
    const activeCPISegment = gcpsScore.cpi === 0 ? 0 : gcpsScore.cpi < 50 ? 1 : 2;

    // Get active segment index for Interference
    const activeInterferenceSegment =
      gcpsScore.interferenceScore < 30
        ? 0
        : gcpsScore.interferenceScore < 50
          ? 1
          : gcpsScore.interferenceScore < 70
            ? 2
            : 3;

    return (
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium">{title}</h4>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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

          {/* Grade label */}
          <p className="text-sm text-muted-foreground mb-2">Chronifizierungsgrad</p>

          {/* Grade scale */}
          <div className="relative">
            <div className="flex h-8 rounded-md overflow-hidden gap-0.5 bg-muted">
              {GCPS_GRADE_SEGMENTS.map((segment, index) => {
                const isActive = index === activeGradeIndex;
                return (
                  <div
                    key={segment.grade}
                    className={`flex-1 ${
                      isActive
                        ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                        : "bg-gray-200"
                    } flex flex-col items-center justify-center transition-all`}
                  >
                    <span
                      className={`text-xs font-bold ${isActive ? "text-white drop-shadow-sm" : "text-gray-400"}`}
                    >
                      {segment.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Labels under scale */}
          <div className="flex mt-1 text-[9px]">
            {GCPS_GRADE_SEGMENTS.map((segment, index) => (
              <div
                key={segment.grade}
                className={`flex-1 text-center ${
                  index === activeGradeIndex
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {segment.sublabel}
              </div>
            ))}
          </div>

          {/* Grade display */}
          <div className="flex items-center justify-center mt-3">
            <span className="text-xl font-bold">
              Grad {gcpsScore.grade === 0 ? "0" : ["I", "II", "III", "IV"][gcpsScore.grade - 1]}
            </span>
            <span className="ml-2 text-sm font-medium">
              - {gcpsScore.gradeInterpretation.labelDe}
            </span>
          </div>

          {/* Clinical interpretation warning */}
          {gcpsScore.grade >= 3 && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-red-600">
              <AlertTriangle className="size-4" />
              <span className="text-sm font-medium">Dysfunktionaler chronischer Schmerz</span>
            </div>
          )}
          {gcpsScore.grade >= 1 && gcpsScore.grade <= 2 && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-yellow-600">
              <AlertTriangle className="size-4" />
              <span className="text-sm font-medium">Funktional persistierender Schmerz</span>
            </div>
          )}
        </CardHeader>

        {/* Expandable details with scoring scales */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="border-t bg-muted/20 p-4 space-y-4">
              {/* Charakteristische Schmerzintensität */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Charakteristische Schmerzintensität: {gcpsScore.cpi}
                </p>
                <div className="flex h-6 rounded-md overflow-hidden gap-0.5 bg-muted">
                  {CPI_SEGMENTS.map((segment, index) => {
                    const isActive = index === activeCPISegment;
                    return (
                      <div
                        key={segment.label}
                        className={`${index === 0 ? "flex-[0.5]" : "flex-1"} ${
                          isActive
                            ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                            : "bg-gray-200"
                        } flex items-center justify-center transition-all`}
                      >
                        <span
                          className={`text-[9px] font-medium ${isActive ? "text-white drop-shadow-sm" : "text-gray-400"}`}
                        >
                          {segment.range}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex mt-1 text-[9px]">
                  <div
                    className={`flex-[0.5] text-center ${activeCPISegment === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    Keine
                  </div>
                  <div
                    className={`flex-1 text-center ${activeCPISegment === 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    Gering
                  </div>
                  <div
                    className={`flex-1 text-center ${activeCPISegment === 2 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    Hoch
                  </div>
                </div>
              </div>

              {/* Beeinträchtigungswert */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Beeinträchtigungswert: {gcpsScore.interferenceScore} →{" "}
                  {gcpsScore.interferencePoints} BP
                </p>
                <div className="flex h-6 rounded-md overflow-hidden gap-0.5 bg-muted">
                  {INTERFERENCE_SEGMENTS.map((segment, index) => {
                    const isActive = index === activeInterferenceSegment;
                    return (
                      <div
                        key={segment.bp}
                        className={`flex-1 ${
                          isActive
                            ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                            : "bg-gray-200"
                        } flex items-center justify-center transition-all`}
                      >
                        <span
                          className={`text-[9px] font-medium ${isActive ? "text-white drop-shadow-sm" : "text-gray-400"}`}
                        >
                          {segment.range}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex mt-1 text-[9px]">
                  {INTERFERENCE_SEGMENTS.map((segment, index) => (
                    <div
                      key={segment.bp}
                      className={`flex-1 text-center ${
                        index === activeInterferenceSegment
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {segment.bp} BP
                    </div>
                  ))}
                </div>
              </div>

              {/* Beeinträchtigungstage und Gesamt-BP */}
              <div className="flex gap-4 text-sm pt-2 border-t">
                <div>
                  <span className="text-muted-foreground">Beeinträchtigungstage:</span>{" "}
                  <span className="font-medium">
                    {gcpsScore.disabilityDays} {gcpsScore.disabilityDays === 1 ? "Tag" : "Tage"}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    → {gcpsScore.disabilityDaysPoints} BP
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gesamt-BP:</span>{" "}
                  <span className="font-medium">{gcpsScore.totalDisabilityPoints}</span>
                </div>
              </div>

              {/* Original answers */}
              <div className="pt-2 border-t">
                <GCPS1MSummary answers={answers as GCPS1MAnswers} />
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    );
  }

  // JFLS-8 Scoring
  if (questionnaireId === QUESTIONNAIRE_ID.JFLS8) {
    const jflsScore = calculateJFLS8Score(answers as JFLS8Answers);
    const activeLimitationIndex = jflsScore.limitationLevel
      ? JFLS8_LIMITATION_SEGMENTS.findIndex(
          (segment) => segment.level === jflsScore.limitationLevel
        )
      : -1;
    const isSignificant = jflsScore.limitationLevel === "significant";

    return (
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium">{title}</h4>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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

          {/* Limitation level label */}
          <p className="text-sm text-muted-foreground mb-2">Kieferfunktions-Einschränkung</p>

          {/* Limitation scale */}
          <div className="relative">
            <div className="flex h-8 rounded-md overflow-hidden gap-0.5 bg-muted">
              {JFLS8_LIMITATION_SEGMENTS.map((segment, index) => {
                const isActive = index === activeLimitationIndex;
                return (
                  <div
                    key={segment.level}
                    className={`flex-1 ${
                      isActive
                        ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                        : "bg-gray-200"
                    } flex flex-col items-center justify-center transition-all`}
                  >
                    <span
                      className={`text-[10px] font-medium ${isActive ? "text-white drop-shadow-sm" : "text-gray-400"}`}
                    >
                      {segment.range}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Labels under scale */}
          <div className="flex mt-1 text-[10px]">
            {JFLS8_LIMITATION_SEGMENTS.map((segment, index) => (
              <div
                key={segment.level}
                className={`flex-1 text-center ${
                  index === activeLimitationIndex
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {segment.label}
              </div>
            ))}
          </div>

          {/* Score display */}
          <div className="flex items-center justify-center mt-3">
            {jflsScore.isValid && jflsScore.globalScore !== null ? (
              <>
                <span className="text-2xl font-bold">{jflsScore.globalScore.toFixed(2)}</span>
                <span className="text-lg text-muted-foreground ml-1">/ {jflsScore.maxScore}</span>
                <span className="ml-3 text-sm font-medium">
                  {jflsScore.limitationInterpretation?.labelDe}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Zu viele fehlende Antworten ({jflsScore.missingCount}/8)
              </span>
            )}
          </div>

          {/* Significant limitation warning */}
          {isSignificant && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-red-600">
              <AlertTriangle className="size-4" />
              <span className="text-sm font-medium">Deutliche Funktionseinschränkung</span>
            </div>
          )}
        </CardHeader>

        {/* Expandable details */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="border-t bg-muted/20 p-4">
              <JFLS8Summary answers={answers as JFLS8Answers} />
            </CardContent>
          </div>
        </div>
      </Card>
    );
  }

  // JFLS-20 Scoring (same methodology as JFLS-8)
  if (questionnaireId === QUESTIONNAIRE_ID.JFLS20) {
    const jflsScore = calculateJFLS20Score(answers as JFLS20Answers);
    const activeLimitationIndex = jflsScore.limitationLevel
      ? JFLS20_LIMITATION_SEGMENTS.findIndex(
          (segment) => segment.level === jflsScore.limitationLevel
        )
      : -1;
    const isSignificant = jflsScore.limitationLevel === "significant";

    return (
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium">{title}</h4>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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

          {/* Limitation level label */}
          <p className="text-sm text-muted-foreground mb-2">
            Kieferfunktions-Einschränkung (erweitert)
          </p>

          {/* Limitation scale */}
          <div className="relative">
            <div className="flex h-8 rounded-md overflow-hidden gap-0.5 bg-muted">
              {JFLS20_LIMITATION_SEGMENTS.map((segment, index) => {
                const isActive = index === activeLimitationIndex;
                return (
                  <div
                    key={segment.level}
                    className={`flex-1 ${
                      isActive
                        ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                        : "bg-gray-200"
                    } flex flex-col items-center justify-center transition-all`}
                  >
                    <span
                      className={`text-[10px] font-medium ${isActive ? "text-white drop-shadow-sm" : "text-gray-400"}`}
                    >
                      {segment.range}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Labels under scale */}
          <div className="flex mt-1 text-[10px]">
            {JFLS20_LIMITATION_SEGMENTS.map((segment, index) => (
              <div
                key={segment.level}
                className={`flex-1 text-center ${
                  index === activeLimitationIndex
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {segment.label}
              </div>
            ))}
          </div>

          {/* Score display */}
          <div className="flex items-center justify-center mt-3">
            {jflsScore.isValid && jflsScore.globalScore !== null ? (
              <>
                <span className="text-2xl font-bold">{jflsScore.globalScore.toFixed(2)}</span>
                <span className="text-lg text-muted-foreground ml-1">/ {jflsScore.maxScore}</span>
                <span className="ml-3 text-sm font-medium">
                  {jflsScore.limitationInterpretation?.labelDe}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                Zu viele fehlende Antworten ({jflsScore.missingCount}/20)
              </span>
            )}
          </div>

          {/* Significant limitation warning */}
          {isSignificant && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-red-600">
              <AlertTriangle className="size-4" />
              <span className="text-sm font-medium">Deutliche Funktionseinschränkung</span>
            </div>
          )}

          {/* Subscales */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 pt-3 border-t text-sm">
            <JFLS20SubscaleDisplay
              label={JFLS20_SUBSCALE_LABELS.mastication.labelDe}
              subscale={jflsScore.subscales.mastication}
              refValues={JFLS20_REFERENCE_VALUES.mastication}
            />
            <JFLS20SubscaleDisplay
              label={JFLS20_SUBSCALE_LABELS.mobility.labelDe}
              subscale={jflsScore.subscales.mobility}
              refValues={JFLS20_REFERENCE_VALUES.mobility}
            />
            <JFLS20SubscaleDisplay
              label={JFLS20_SUBSCALE_LABELS.communication.labelDe}
              subscale={jflsScore.subscales.communication}
              refValues={JFLS20_REFERENCE_VALUES.communication}
            />
          </div>
        </CardHeader>

        {/* Expandable details */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="border-t bg-muted/20 p-4">
              <JFLS20Summary answers={answers as JFLS20Answers} />
            </CardContent>
          </div>
        </div>
      </Card>
    );
  }

  // OBC Scoring
  if (questionnaireId === QUESTIONNAIRE_ID.OBC) {
    const obcScore = calculateOBCScore(answers as OBCAnswers);
    const activeRiskIndex = OBC_RISK_SEGMENTS.findIndex(
      (segment) => segment.level === obcScore.riskLevel
    );
    const isHighRisk = obcScore.riskLevel === "high";

    return (
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium">{title}</h4>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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

          {/* Risk level label */}
          <p className="text-sm text-muted-foreground mb-2">Orale Verhaltensweisen - TMD-Risiko</p>

          {/* Risk scale */}
          <div className="relative">
            <div className="flex h-8 rounded-md overflow-hidden gap-0.5 bg-muted">
              {OBC_RISK_SEGMENTS.map((segment, index) => {
                const isActive = index === activeRiskIndex;
                return (
                  <div
                    key={segment.level}
                    className={`flex-1 ${
                      isActive
                        ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                        : "bg-gray-200"
                    } flex flex-col items-center justify-center transition-all`}
                  >
                    <span
                      className={`text-[10px] font-medium ${isActive ? "text-white drop-shadow-sm" : "text-gray-400"}`}
                    >
                      {segment.range}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Labels under scale */}
          <div className="flex mt-1 text-[10px]">
            {OBC_RISK_SEGMENTS.map((segment, index) => (
              <div
                key={segment.level}
                className={`flex-1 text-center ${
                  index === activeRiskIndex
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {segment.label}
              </div>
            ))}
          </div>

          {/* Score display */}
          <div className="flex items-center justify-center mt-3">
            <span className="text-2xl font-bold">{obcScore.totalScore}</span>
            <span className="text-lg text-muted-foreground ml-1">/ {obcScore.maxScore}</span>
            <span className="ml-3 text-sm font-medium">{obcScore.riskInterpretation.labelDe}</span>
          </div>

          {/* High risk warning */}
          {isHighRisk && (
            <div className="flex items-center justify-center gap-1.5 mt-2 text-red-600">
              <AlertTriangle className="size-4" />
              <span className="text-sm font-medium">Trägt zur Entstehung von CMD bei</span>
            </div>
          )}
        </CardHeader>

        {/* Expandable details */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="border-t bg-muted/20 p-4">
              <OBCSummary answers={answers as OBCAnswers} />
            </CardContent>
          </div>
        </div>
      </Card>
    );
  }

  // Only PHQ-4 scoring is implemented
  if (questionnaireId !== QUESTIONNAIRE_ID.PHQ4) {
    return (
      <Card>
        <CardHeader className="p-4">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">Bewertung nicht verfügbar</p>
        </CardHeader>
      </Card>
    );
  }

  const score = calculatePHQ4Score(answers as Record<string, string>);
  const interpretation = getPHQ4Interpretation(score);
  const anxietyResult = getSubscaleInterpretation(score.anxiety);
  const depressionResult = getSubscaleInterpretation(score.depression);
  const activeSegment = getActiveSegment(score.total);
  const isClinicallyRelevant = score.total >= PHQ4_CLINICAL_CUTOFF;

  return (
    <Card className="overflow-hidden py-0 gap-0">
      <CardHeader className="p-4">
        {/* Header with title, subtitle and expand button */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-medium">{title}</h4>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
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
          <div className="flex h-8 rounded-md overflow-hidden gap-0.5 bg-muted">
            {PHQ4_SEVERITY_SEGMENTS.map((segment, index) => {
              const isActive = index === activeSegment;
              return (
                <div
                  key={segment.label}
                  className={`flex-1 ${
                    isActive
                      ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                      : "bg-gray-200"
                  } flex flex-col items-center justify-center transition-all`}
                >
                  <span
                    className={`text-[10px] font-medium ${isActive ? "text-white drop-shadow-sm" : "text-gray-400"}`}
                  >
                    {segment.range}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Cutoff line at 6 (50% position) */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-black/60"
            style={{ left: "50%" }}
            title="Klinischer Cutoff (≥6)"
          />
        </div>

        {/* Labels under scale */}
        <div className="flex mt-1 text-[10px]">
          {PHQ4_SEVERITY_SEGMENTS.map((segment, index) => (
            <div
              key={segment.label}
              className={`flex-1 text-center ${
                index === activeSegment ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
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
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <CardContent className="border-t bg-muted/20 p-4">
            <PHQ4Summary answers={answers as Record<string, string>} />
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
