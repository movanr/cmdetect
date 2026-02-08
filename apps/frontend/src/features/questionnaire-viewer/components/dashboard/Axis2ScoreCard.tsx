/**
 * Axis 2 Score Card - Displays questionnaire scores with horizontal severity scale
 * Used in the dashboard for quick severity assessment before patient review
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
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
import { AlertTriangle, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { SCORING_MANUAL_ANCHORS } from "../../content/dashboard-instructions";
import {
  GCPSAnswersTable,
  JFLS20AnswersTable,
  JFLS8AnswersTable,
  OBCAnswersTable,
  PHQ4AnswersTable,
} from "./questionnaire-tables";

// Clinical cutoff threshold per Löwe et al. (2010)
export const PHQ4_CLINICAL_CUTOFF = 6;

// PHQ-4 Severity scale segments
export const PHQ4_SEVERITY_SEGMENTS = [
  { label: "Normal", range: "0-2", min: 0, max: 2, color: "bg-green-500" },
  { label: "Mild", range: "3-5", min: 3, max: 5, color: "bg-yellow-500" },
  { label: "Moderat", range: "6-8", min: 6, max: 8, color: "bg-orange-500" },
  { label: "Schwer", range: "9-12", min: 9, max: 12, color: "bg-red-500" },
] as const;

// GCPS Grade scale segments (0-IV) - German labels per DC/TMD manual
export const GCPS_GRADE_SEGMENTS: Array<{
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

// OBC Risk level segments based on TMD prevalence comparison
export const OBC_RISK_SEGMENTS: Array<{
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
export const JFLS8_LIMITATION_SEGMENTS: Array<{
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
export const JFLS20_LIMITATION_SEGMENTS: Array<{
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
export function getActiveSegment(score: number): number {
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

/**
 * Horizontal 3-column layout for score cards:
 * LEFT: title/subtitle/warning | CENTER: scale bar | RIGHT: score + interpretation
 */
interface HorizontalScoreLayoutProps {
  title: string;
  subtitle?: string;
  /** Scoring manual heading anchor — renders a link when provided */
  manualAnchor?: string;
  scaleLabel: string;
  scaleBar: ReactNode;
  scoreDisplay: ReactNode;
  warning?: ReactNode;
  subscales?: ReactNode;
  isExpanded: boolean;
  onToggleExpand: () => void;
  expandedContent?: ReactNode;
}

function HorizontalScoreLayout({
  title,
  subtitle,
  manualAnchor,
  scaleLabel,
  scaleBar,
  scoreDisplay,
  warning,
  subscales,
  isExpanded,
  onToggleExpand,
  expandedContent,
}: HorizontalScoreLayoutProps) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_minmax(250px,2fr)_minmax(150px,1fr)] gap-x-6 gap-y-4 items-center">
          {/* LEFT: Title + warning */}
          <div className="min-w-0">
            <h4 className="font-medium text-sm leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            {manualAnchor && (
              <Link
                to="/docs/scoring-manual"
                hash={manualAnchor}
                onClick={() => sessionStorage.setItem("docs-return-url", window.location.pathname)}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline mt-0.5"
              >
                <BookOpen className="h-3 w-3" />
                Scoring-Anleitung
              </Link>
            )}
            {warning && <div className="mt-1.5">{warning}</div>}
          </div>

          {/* CENTER: Scale bar */}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{scaleLabel}</p>
            {scaleBar}
          </div>

          {/* RIGHT: Score + expand */}
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex flex-col gap-1">
              {scoreDisplay}
              {subscales && <div className="mt-1">{subscales}</div>}
            </div>
            {expandedContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="text-muted-foreground h-7 px-2 text-xs shrink-0"
              >
                {isExpanded ? (
                  <>
                    Ausblenden <ChevronUp className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    Details <ChevronDown className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable details */}
      {expandedContent && (
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="border-t bg-muted/20 p-4">{expandedContent}</CardContent>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Reusable scale bar component for segment-based severity scales
 */
export function ScaleBar({
  segments,
  activeIndex,
  cutoffPosition,
}: {
  segments: ReadonlyArray<{ label?: string; range?: string; color: string }>;
  activeIndex: number;
  cutoffPosition?: string;
}) {
  return (
    <div className="relative">
      <div className="flex h-6 rounded-md overflow-hidden gap-0.5 bg-muted">
        {segments.map((segment, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              className={`flex-1 ${
                isActive
                  ? `${segment.color} ring-2 ring-black/60 ring-inset scale-105 z-10 rounded-sm shadow-md`
                  : "bg-gray-200"
              } flex items-center justify-center transition-all`}
            >
              <span
                className={`text-[9px] font-medium ${isActive ? "text-white drop-shadow-sm" : "text-gray-400"}`}
              >
                {segment.range ?? segment.label}
              </span>
            </div>
          );
        })}
      </div>
      {cutoffPosition && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-black/60"
          style={{ left: cutoffPosition }}
          title="Klinischer Cutoff"
        />
      )}
    </div>
  );
}

/**
 * Labels rendered below a scale bar
 */
export function ScaleLabels({
  labels,
  activeIndex,
}: {
  labels: ReadonlyArray<{ label: string; key: string | number }>;
  activeIndex: number;
}) {
  return (
    <div className="flex mt-1 text-[9px]">
      {labels.map((item, index) => (
        <div
          key={item.key}
          className={`flex-1 text-center ${
            index === activeIndex ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
        >
          {item.label}
        </div>
      ))}
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

  // GCPS-1M Scoring
  if (questionnaireId === QUESTIONNAIRE_ID.GCPS_1M) {
    const gcpsScore = calculateGCPS1MScore(answers as GCPS1MAnswers);
    const activeGradeIndex = gcpsScore.grade;

    const gradeRoman = gcpsScore.grade === 0 ? "0" : ["I", "II", "III", "IV"][gcpsScore.grade - 1];

    return (
      <HorizontalScoreLayout
        title={title}
        subtitle={subtitle}
        manualAnchor={manualAnchor}
        scaleLabel="Chronifizierungsgrad"
        scaleBar={
          <>
            <ScaleBar
              segments={GCPS_GRADE_SEGMENTS.map((s) => ({
                label: s.label,
                color: s.color,
              }))}
              activeIndex={activeGradeIndex}
            />
            <ScaleLabels
              labels={GCPS_GRADE_SEGMENTS.map((s) => ({ label: s.sublabel, key: s.grade }))}
              activeIndex={activeGradeIndex}
            />
          </>
        }
        scoreDisplay={
          <div className="text-left">
            <div className="text-xl font-bold leading-tight">Grad {gradeRoman}</div>
            <div className="text-xs text-muted-foreground">
              {gcpsScore.gradeInterpretation.label}
            </div>
          </div>
        }
        warning={
          gcpsScore.grade >= 3 ? (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span className="text-xs font-medium">Dysfunktionaler chronischer Schmerz</span>
            </div>
          ) : gcpsScore.grade >= 1 ? (
            <div className="flex items-center gap-1.5 text-yellow-600">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span className="text-xs font-medium">Funktional persistierender Schmerz</span>
            </div>
          ) : undefined
        }
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        expandedContent={
          <div className="space-y-3">
            {/* Scoring breakdown — stat cells */}
            <div className="grid grid-cols-4 divide-x rounded-md border text-center">
              {/* CPI */}
              <div className="px-3 py-2">
                <div className="text-[10px] text-muted-foreground leading-tight">
                  Schmerzintensität
                </div>
                <div className="text-lg font-semibold leading-tight mt-0.5">{gcpsScore.cpi}</div>
                <div className="text-[10px] text-muted-foreground">CPI</div>
              </div>
              {/* Interference score → BP */}
              <div className="px-3 py-2">
                <div className="text-[10px] text-muted-foreground leading-tight">
                  Beeinträchtigung
                </div>
                <div className="text-lg font-semibold leading-tight mt-0.5">
                  {gcpsScore.interferenceScore}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  → {gcpsScore.interferencePoints} BP
                </div>
              </div>
              {/* Disability days → BP */}
              <div className="px-3 py-2">
                <div className="text-[10px] text-muted-foreground leading-tight">Beeintr.-Tage</div>
                <div className="text-lg font-semibold leading-tight mt-0.5">
                  {gcpsScore.disabilityDays}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  → {gcpsScore.disabilityDaysPoints} BP
                </div>
              </div>
              {/* Total BP */}
              <div className="px-3 py-2 bg-muted/40">
                <div className="text-[10px] text-muted-foreground leading-tight">Gesamt</div>
                <div className="text-lg font-semibold leading-tight mt-0.5">
                  {gcpsScore.totalDisabilityPoints}
                </div>
                <div className="text-[10px] text-muted-foreground">BP</div>
              </div>
            </div>

            {/* Original answers */}
            <div className="pt-2 border-t">
              <GCPSAnswersTable answers={answers as GCPS1MAnswers} showPips />
            </div>
          </div>
        }
      />
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
      <HorizontalScoreLayout
        title={title}
        subtitle={subtitle}
        manualAnchor={manualAnchor}
        scaleLabel="Kieferfunktions-Einschränkung"
        scaleBar={
          <>
            <ScaleBar segments={JFLS8_LIMITATION_SEGMENTS} activeIndex={activeLimitationIndex} />
            <ScaleLabels
              labels={JFLS8_LIMITATION_SEGMENTS.map((s) => ({ label: s.label, key: s.level }))}
              activeIndex={activeLimitationIndex}
            />
          </>
        }
        scoreDisplay={
          <div className="text-left">
            {jflsScore.isValid && jflsScore.globalScore !== null ? (
              <>
                <div className="text-xl font-bold leading-tight">
                  {jflsScore.globalScore.toFixed(2)}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{jflsScore.maxScore}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {jflsScore.limitationInterpretation?.label}
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                Zu viele fehlende Antworten ({jflsScore.missingCount}/8)
              </span>
            )}
          </div>
        }
        warning={
          isSignificant ? (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span className="text-xs font-medium">Deutliche Funktionseinschränkung</span>
            </div>
          ) : undefined
        }
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        expandedContent={<JFLS8AnswersTable answers={answers as JFLS8Answers} showPips />}
      />
    );
  }

  // JFLS-20 Scoring
  if (questionnaireId === QUESTIONNAIRE_ID.JFLS20) {
    const jflsScore = calculateJFLS20Score(answers as JFLS20Answers);
    const activeLimitationIndex = jflsScore.limitationLevel
      ? JFLS20_LIMITATION_SEGMENTS.findIndex(
          (segment) => segment.level === jflsScore.limitationLevel
        )
      : -1;
    const isSignificant = jflsScore.limitationLevel === "significant";

    return (
      <HorizontalScoreLayout
        title={title}
        subtitle={subtitle}
        manualAnchor={manualAnchor}
        scaleLabel="Kieferfunktions-Einschränkung (erweitert)"
        scaleBar={
          <>
            <ScaleBar segments={JFLS20_LIMITATION_SEGMENTS} activeIndex={activeLimitationIndex} />
            <ScaleLabels
              labels={JFLS20_LIMITATION_SEGMENTS.map((s) => ({ label: s.label, key: s.level }))}
              activeIndex={activeLimitationIndex}
            />
          </>
        }
        scoreDisplay={
          <div className="text-left">
            {jflsScore.isValid && jflsScore.globalScore !== null ? (
              <>
                <div className="text-xl font-bold leading-tight">
                  {jflsScore.globalScore.toFixed(2)}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{jflsScore.maxScore}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {jflsScore.limitationInterpretation?.label}
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                Zu viele fehlende Antworten ({jflsScore.missingCount}/20)
              </span>
            )}
          </div>
        }
        warning={
          isSignificant ? (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span className="text-xs font-medium">Deutliche Funktionseinschränkung</span>
            </div>
          ) : undefined
        }
        subscales={
          jflsScore.isValid ? (
            <div className="text-xs space-y-0.5">
              <JFLS20SubscaleDisplay
                label={JFLS20_SUBSCALE_LABELS.mastication.label}
                subscale={jflsScore.subscales.mastication}
                refValues={JFLS20_REFERENCE_VALUES.mastication}
              />
              <JFLS20SubscaleDisplay
                label={JFLS20_SUBSCALE_LABELS.mobility.label}
                subscale={jflsScore.subscales.mobility}
                refValues={JFLS20_REFERENCE_VALUES.mobility}
              />
              <JFLS20SubscaleDisplay
                label={JFLS20_SUBSCALE_LABELS.communication.label}
                subscale={jflsScore.subscales.communication}
                refValues={JFLS20_REFERENCE_VALUES.communication}
              />
            </div>
          ) : undefined
        }
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        expandedContent={<JFLS20AnswersTable answers={answers as JFLS20Answers} showPips />}
      />
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
      <HorizontalScoreLayout
        title={title}
        subtitle={subtitle}
        manualAnchor={manualAnchor}
        scaleLabel="Orale Verhaltensweisen - CMD-Risiko"
        scaleBar={
          <>
            <ScaleBar segments={OBC_RISK_SEGMENTS} activeIndex={activeRiskIndex} />
            <ScaleLabels
              labels={OBC_RISK_SEGMENTS.map((s) => ({ label: s.label, key: s.level }))}
              activeIndex={activeRiskIndex}
            />
          </>
        }
        scoreDisplay={
          <div className="text-left">
            <div className="text-xl font-bold leading-tight">
              {obcScore.totalScore}
              <span className="text-sm text-muted-foreground font-normal">
                /{obcScore.maxScore}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">{obcScore.riskInterpretation.label}</div>
          </div>
        }
        warning={
          isHighRisk ? (
            <div className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span className="text-xs font-medium">Risikofaktor zur Entstehung von CMD</span>
            </div>
          ) : undefined
        }
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        expandedContent={<OBCAnswersTable answers={answers as OBCAnswers} showPips />}
      />
    );
  }

  // PHQ-4 Scoring (default / fallback for known questionnaire)
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

  const score = calculatePHQ4Score(answers as Record<string, string>);
  const interpretation = getPHQ4Interpretation(score);
  const anxietyResult = getSubscaleInterpretation(score.anxiety);
  const depressionResult = getSubscaleInterpretation(score.depression);
  const activeSegment = getActiveSegment(score.total);
  const isClinicallyRelevant = score.total >= PHQ4_CLINICAL_CUTOFF;

  return (
    <HorizontalScoreLayout
      title={title}
      subtitle={subtitle}
      manualAnchor={manualAnchor}
      scaleLabel="Schweregrad"
      scaleBar={
        <>
          <ScaleBar
            segments={PHQ4_SEVERITY_SEGMENTS}
            activeIndex={activeSegment}
            cutoffPosition="50%"
          />
          <ScaleLabels
            labels={PHQ4_SEVERITY_SEGMENTS.map((s) => ({ label: s.label, key: s.label }))}
            activeIndex={activeSegment}
          />
        </>
      }
      scoreDisplay={
        <div className="text-left">
          <div className="text-xl font-bold leading-tight">
            {score.total}
            <span className="text-sm text-muted-foreground font-normal">/{score.maxTotal}</span>
          </div>
          <div className="text-xs text-muted-foreground">{interpretation.label}</div>
        </div>
      }
      warning={
        isClinicallyRelevant ? (
          <div className="flex items-center gap-1.5 text-orange-600">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span className="text-xs font-medium">Klinisch auffällig (≥6 Punkte)</span>
          </div>
        ) : undefined
      }
      subscales={
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Angst:</span>
            <span className={anxietyResult.positive ? "text-orange-600 font-medium" : ""}>
              {score.anxiety}/{score.maxAnxiety}
            </span>
            {anxietyResult.positive && <span className="text-[10px] text-orange-600">(≥3)</span>}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Depression:</span>
            <span className={depressionResult.positive ? "text-orange-600 font-medium" : ""}>
              {score.depression}/{score.maxDepression}
            </span>
            {depressionResult.positive && <span className="text-[10px] text-orange-600">(≥3)</span>}
          </div>
        </div>
      }
      isExpanded={isExpanded}
      onToggleExpand={() => setIsExpanded(!isExpanded)}
      expandedContent={<PHQ4AnswersTable answers={answers as Record<string, string>} showPips />}
    />
  );
}
