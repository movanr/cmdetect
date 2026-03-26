/**
 * Axis 2 Score Card - Displays questionnaire scores with horizontal severity scale
 * Used in the dashboard for quick severity assessment before patient review
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  GCPS1MAnswers,
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
  getSubscaleInterpretation,
  JFLS20_REFERENCE_VALUES,
  JFLS20_SUBSCALE_LABELS,
  QUESTIONNAIRE_ID,
} from "@cmdetect/questionnaires";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
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

// PHQ-4 Severity scale segments
// eslint-disable-next-line react-refresh/only-export-components
export const PHQ4_SEVERITY_SEGMENTS = [
  { label: "0–2", range: "0-2", min: 0, max: 2, color: "bg-gray-300" },
  { label: "3–5", range: "3-5", min: 3, max: 5, color: "bg-gray-400" },
  { label: "6–8", range: "6-8", min: 6, max: 8, color: "bg-gray-600", sublabel: "Cutoff ≥6" },
  { label: "9–12", range: "9-12", min: 9, max: 12, color: "bg-gray-700" },
] as const;

// GCPS CSI (Charakteristische Schmerzintensität) scale segments
const GCPS_CSI_SEGMENTS = [
  { label: "0", range: "0", color: "bg-gray-300" },
  { label: "1–49", range: "1–49", color: "bg-gray-500" },
  { label: "50–100", range: "50–100", color: "bg-gray-700" },
] as const;

// GCPS BP (Beeinträchtigungspunkte) scale segments
const GCPS_BP_SEGMENTS = [
  { label: "0–2", range: "0–2", color: "bg-gray-300" },
  { label: "3–4", range: "3–4", color: "bg-gray-500" },
  { label: "5–6", range: "5–6", color: "bg-gray-700" },
] as const;

// OBC Risk level segments based on TMD prevalence comparison
// eslint-disable-next-line react-refresh/only-export-components
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
    label: "0–16",
    sublabel: "",
    range: "0-16",
    min: 0,
    max: 16,
    color: "bg-gray-300",
  },
  {
    level: "elevated",
    label: "17–24",
    sublabel: "2× häufiger bei CMD",
    range: "17-24",
    min: 17,
    max: 24,
    color: "bg-gray-500",
  },
  {
    level: "high",
    label: "25+",
    sublabel: "17× häufiger bei CMD",
    range: "25+",
    min: 25,
    max: 84,
    color: "bg-gray-700",
  },
];

// JFLS-8 Limitation level segments based on reference values
// Healthy: 0.16, Chronic TMD: 1.74
// eslint-disable-next-line react-refresh/only-export-components
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
    label: "<0.5",
    sublabel: "Ref: Gesund 0.16",
    range: "<0.5",
    min: 0,
    max: 0.5,
    color: "bg-gray-300",
  },
  {
    level: "mild",
    label: "0.5–1.5",
    sublabel: "",
    range: "0.5-1.5",
    min: 0.5,
    max: 1.5,
    color: "bg-gray-500",
  },
  {
    level: "significant",
    label: "≥1.5",
    sublabel: "Ref: TMD 1.74",
    range: "≥1.5",
    min: 1.5,
    max: 10,
    color: "bg-gray-700",
  },
];

// JFLS-20 Limitation level segments (same reference values as JFLS-8)
// eslint-disable-next-line react-refresh/only-export-components
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
    label: "<0.5",
    sublabel: "Ref: Gesund 0.16",
    range: "<0.5",
    min: 0,
    max: 0.5,
    color: "bg-gray-300",
  },
  {
    level: "mild",
    label: "0.5–1.5",
    sublabel: "",
    range: "0.5-1.5",
    min: 0.5,
    max: 1.5,
    color: "bg-gray-500",
  },
  {
    level: "significant",
    label: "≥1.5",
    sublabel: "Ref: TMD 1.74",
    range: "≥1.5",
    min: 1.5,
    max: 10,
    color: "bg-gray-700",
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
// eslint-disable-next-line react-refresh/only-export-components
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
 * LEFT: title/subtitle | CENTER: scale bar | RIGHT: score
 */
interface HorizontalScoreLayoutProps {
  title: string;
  subtitle?: string;
  /** Scoring manual heading anchor — renders a link when provided */
  manualAnchor?: string;
  /** Small description text rendered below the Scoring-Anleitung link */
  description?: ReactNode;
  scaleLabel: string;
  scaleBar: ReactNode;
  scoreDisplay: ReactNode;
  subscales?: ReactNode;
  isExpanded: boolean;
  onToggleExpand: () => void;
  expandedContent?: ReactNode;
}

function HorizontalScoreLayout({
  title,
  subtitle,
  manualAnchor,
  description,
  scaleLabel,
  scaleBar,
  scoreDisplay,
  subscales,
  isExpanded,
  onToggleExpand,
  expandedContent,
}: HorizontalScoreLayoutProps) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div
        className={`p-4${expandedContent ? " cursor-pointer hover:bg-muted/30 transition-colors" : ""}`}
        onClick={expandedContent ? onToggleExpand : undefined}
      >
        <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_minmax(250px,2fr)_minmax(150px,1fr)] gap-x-6 gap-y-4 items-center">
          {/* LEFT: Title */}
          <div className="min-w-0">
            <h4 className="font-medium text-sm leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            {manualAnchor && (
              <Link
                to="/docs/scoring-manual"
                hash={manualAnchor}
                onClick={(e) => {
                  e.stopPropagation();
                  sessionStorage.setItem("docs-return-url", window.location.pathname);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline mt-0.5"
              >
                <BookOpen className="h-3 w-3" />
                Scoring-Anleitung
              </Link>
            )}
            {description && (
              <div className="text-[10px] text-muted-foreground/60 leading-snug mt-0.5">
                {description}
              </div>
            )}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
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
          const isLightBg = segment.color.includes("-200") || segment.color.includes("-300");
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
                className={`text-[9px] font-medium ${isActive ? (isLightBg ? "text-gray-600" : "text-white drop-shadow-sm") : "text-gray-400"}`}
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
    const activeCsiIndex = gcpsScore.cpi === 0 ? 0 : gcpsScore.cpi < 50 ? 1 : 2;
    const activeBpIndex =
      gcpsScore.totalDisabilityPoints <= 2 ? 0 : gcpsScore.totalDisabilityPoints <= 4 ? 1 : 2;

    return (
      <HorizontalScoreLayout
        title={title}
        subtitle={subtitle}
        manualAnchor={manualAnchor}
        description="Grad 0: kein Schmerz (CSI = 0). Grad I: geringe Intensität (CSI < 50, BP < 3). Grad II: hohe Intensität (CSI ≥ 50, BP < 3). Grad III: mäßige Einschränkung (BP 3–4). Grad IV: hochgradige Einschränkung (BP 5–6)."
        scaleLabel=""
        scaleBar={
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                CSI <span className="font-semibold text-foreground">{gcpsScore.cpi}</span>
                <span className="text-muted-foreground/50">/100</span>
              </p>
              <ScaleBar segments={[...GCPS_CSI_SEGMENTS]} activeIndex={activeCsiIndex} />
              <div className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-0.5">
                <span>CSI =</span>
                <span className="inline-flex flex-col items-center leading-[1.1]">
                  <span>Frage 2 + 3 + 4</span>
                  <span className="border-t border-current w-full text-center">3</span>
                </span>
                <span>× 10</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                BP Gesamt{" "}
                <span className="font-semibold text-foreground">
                  {gcpsScore.totalDisabilityPoints}
                </span>
                <span className="text-muted-foreground/50">/6</span>
              </p>
              <ScaleBar segments={[...GCPS_BP_SEGMENTS]} activeIndex={activeBpIndex} />
              <div className="text-[10px] text-muted-foreground/60 mt-1 space-y-0.5">
                <div>BP Gesamt = BP subj. Beeinträchtigung + BP Beeinträchtigungstage</div>
                <div className="flex items-center gap-0.5 text-muted-foreground/40">
                  <span>BP subj. Beeinträchtigung =</span>
                  <span className="inline-flex flex-col items-center leading-[1.1]">
                    <span>Frage 6 + 7 + 8</span>
                    <span className="border-t border-current w-full text-center">3</span>
                  </span>
                  <span>× 10</span>
                </div>
                <div className="text-muted-foreground/40">
                  BP Beeinträchtigungstage = BP aus Frage 5 (0–1 → 0 BP, 2 → 1 BP, 3–5 → 2 BP, ≥6 →
                  3 BP)
                </div>
              </div>
            </div>
          </div>
        }
        scoreDisplay={
          <div className="text-left space-y-1">
            <div>
              <div className="text-base font-bold leading-tight">
                {gcpsScore.cpi}
                <span className="text-sm text-muted-foreground font-normal">/100</span>
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                CSI (Charakteristische Schmerzintensität)
              </div>
            </div>
            <div>
              <div className="text-base font-bold leading-tight">
                {gcpsScore.totalDisabilityPoints}
                <span className="text-sm text-muted-foreground font-normal">/6</span>
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                BP (Beeinträchtigungspunkte)
              </div>
            </div>
          </div>
        }
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        expandedContent={<GCPSAnswersTable answers={answers as GCPS1MAnswers} showPips />}
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

    return (
      <HorizontalScoreLayout
        title={title}
        subtitle={subtitle}
        manualAnchor={manualAnchor}
        description="Gesunde Population: ⌀ 0,16 — Chronische CMD: ⌀ 1,74 (max. 2 fehlende Fragen)"
        scaleLabel="Kieferfunktions-Einschränkung"
        scaleBar={
          <ScaleBar segments={JFLS8_LIMITATION_SEGMENTS} activeIndex={activeLimitationIndex} />
        }
        scoreDisplay={
          <div className="text-left">
            {jflsScore.isValid && jflsScore.globalScore !== null ? (
              <>
                <div className="text-xl font-bold leading-tight">
                  <span className="text-sm text-muted-foreground font-normal">⌀ </span>
                  {jflsScore.globalScore.toFixed(2)}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{jflsScore.maxScore}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                Zu viele fehlende Antworten ({jflsScore.missingCount}/8)
              </span>
            )}
          </div>
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

    return (
      <HorizontalScoreLayout
        title={title}
        subtitle={subtitle}
        manualAnchor={manualAnchor}
        description="Gesunde Population: ⌀ 0,16 — Chronische CMD: ⌀ 1,74 (max. 2 fehlend)"
        scaleLabel="Kieferfunktions-Einschränkung (erweitert)"
        scaleBar={
          <ScaleBar segments={JFLS20_LIMITATION_SEGMENTS} activeIndex={activeLimitationIndex} />
        }
        scoreDisplay={
          <div className="text-left">
            {jflsScore.isValid && jflsScore.globalScore !== null ? (
              <>
                <div className="text-xl font-bold leading-tight">
                  <span className="text-sm text-muted-foreground font-normal">⌀ </span>
                  {jflsScore.globalScore.toFixed(2)}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{jflsScore.maxScore}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                Zu viele fehlende Antworten ({jflsScore.missingCount}/20)
              </span>
            )}
          </div>
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
    return (
      <HorizontalScoreLayout
        title={title}
        subtitle={subtitle}
        manualAnchor={manualAnchor}
        description="Gesamtpunktzahl = Summe aller Fragen (Bereich 0–84). Risikostufen: 0–16 Normal, 17–24 Erhöht (2× häufiger bei CMD), ≥25 Hoch (17× häufiger bei CMD, trägt zur Entstehung bei)."
        scaleLabel="Orale Verhaltensweisen - CMD-Risiko"
        scaleBar={<ScaleBar segments={OBC_RISK_SEGMENTS} activeIndex={activeRiskIndex} />}
        scoreDisplay={
          <div className="text-left">
            <div className="text-xl font-bold leading-tight">
              {obcScore.totalScore}
              <span className="text-sm text-muted-foreground font-normal">
                /{obcScore.maxScore}
              </span>
            </div>
          </div>
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
  const anxietyResult = getSubscaleInterpretation(score.anxiety);
  const depressionResult = getSubscaleInterpretation(score.depression);
  const activeSegment = getActiveSegment(score.total);

  return (
    <HorizontalScoreLayout
      title={title}
      subtitle={subtitle}
      manualAnchor={manualAnchor}
      description="0–2 Normal, 3–5 Mild, 6–8 Moderat, 9–12 Schwer. Cutoff ≥ 6. Subskalen für Angst und Depression ≥ 3 auffällig."
      scaleLabel="Schweregrad"
      scaleBar={
        <ScaleBar
          segments={PHQ4_SEVERITY_SEGMENTS}
          activeIndex={activeSegment}
          cutoffPosition="50%"
        />
      }
      scoreDisplay={
        <div className="text-left">
          <div className="text-xl font-bold leading-tight">
            {score.total}
            <span className="text-sm text-muted-foreground font-normal">/{score.maxTotal}</span>
          </div>
        </div>
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
