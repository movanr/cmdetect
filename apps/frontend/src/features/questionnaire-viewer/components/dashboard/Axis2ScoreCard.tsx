/**
 * Axis 2 Score Cards — EU MDR compliant: displays only arithmetic scores,
 * clinician records their own clinical determination via dropdown.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  GCPS1MAnswers,
  JFLS20Answers,
  JFLS20SubscaleScore,
  JFLS8Answers,
  OBCAnswers,
  PHQ4Score,
} from "@cmdetect/questionnaires";
import {
  calculateGCPS1MScore,
  calculateJFLS20Score,
  calculateJFLS8Score,
  calculateOBCScore,
  calculatePHQ4Score,
  JFLS20_SUBSCALE_LABELS,
  QUESTIONNAIRE_ID,
} from "@cmdetect/questionnaires";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { SCORING_MANUAL_ANCHORS } from "../../content/dashboard-instructions";
import { ClinicianDetermination } from "./ClinicianDetermination";
import type { DeterminationOption } from "./ClinicianDetermination";
import {
  GCPSAnswersTable,
  JFLS20AnswersTable,
  JFLS8AnswersTable,
  OBCAnswersTable,
  PHQ4AnswersTable,
} from "./questionnaire-tables";

// ─── Determination options per questionnaire ────────────────────────────

const PHQ4_DETERMINATION_OPTIONS: DeterminationOption[] = [
  { value: "normal", label: "Normal" },
  { value: "leicht", label: "Leicht" },
  { value: "moderat", label: "Moderat" },
  { value: "schwer", label: "Schwer" },
];

const GCPS_DETERMINATION_OPTIONS: DeterminationOption[] = [
  { value: "grad_0", label: "Grad 0" },
  { value: "grad_1", label: "Grad I" },
  { value: "grad_2", label: "Grad II" },
  { value: "grad_3", label: "Grad III" },
  { value: "grad_4", label: "Grad IV" },
];

// JFLS-8, JFLS-20, OBC: "Norms have not yet been established" (DC/TMD scoring manual)
// → free text only, no dropdown categories

// ─── Shared score card layout ───────────────────────────────────────────

interface ScoreCardLayoutProps {
  title: string;
  manualAnchor?: string;
  scoreDisplay: React.ReactNode;
  /** Omit for free-text-only mode (instruments without validated norms) */
  determinationOptions?: DeterminationOption[];
  expandedContent: React.ReactNode;
}

/**
 * Shared layout: header (title + scores), clinician determination, expandable details.
 */
function ScoreCardLayout({
  title,
  manualAnchor,
  scoreDisplay,
  determinationOptions,
  expandedContent,
}: ScoreCardLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [determination, setDetermination] = useState("");
  const [freeText, setFreeText] = useState("");
  const [note, setNote] = useState("");

  return (
    <Card className="overflow-hidden py-0 gap-0">
      {/* Header: title + scores */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="font-medium text-sm leading-tight">{title}</h4>
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
          </div>
          <div className="flex items-start gap-4 shrink-0">
            {scoreDisplay}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
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
          </div>
        </div>
      </div>

      {/* Clinician determination */}
      <ClinicianDetermination
        options={determinationOptions}
        value={determinationOptions ? determination : undefined}
        onValueChange={determinationOptions ? setDetermination : undefined}
        freeText={determinationOptions ? undefined : freeText}
        onFreeTextChange={determinationOptions ? undefined : setFreeText}
        note={note}
        onNoteChange={setNote}
      />

      {/* Expandable details */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <CardContent className="border-t bg-muted/20 p-4">
            {expandedContent}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

// ─── JFLS-20 subscale display (plain, no classification highlighting) ───

function JFLS20SubscaleDisplay({
  label,
  subscale,
}: {
  label: string;
  subscale: JFLS20SubscaleScore;
}) {
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
      <span>{subscale.score?.toFixed(1)}</span>
    </div>
  );
}

// ─── Individual score card renderers ────────────────────────────────────

function PHQ4ScoreCard({ title, manualAnchor, score, answers }: {
  title: string;
  manualAnchor?: string;
  score: PHQ4Score;
  answers: Record<string, string>;
}) {
  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      determinationOptions={PHQ4_DETERMINATION_OPTIONS}
      scoreDisplay={
        <div className="text-right">
          <div className="text-xl font-bold leading-tight">
            Gesamt: {score.total}
            <span className="text-sm text-muted-foreground font-normal">/{score.maxTotal}</span>
          </div>
          <div className="flex gap-3 text-xs mt-1">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">GAD-2:</span>
              <span>{score.anxiety}/{score.maxAnxiety}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">PHQ-2:</span>
              <span>{score.depression}/{score.maxDepression}</span>
            </div>
          </div>
        </div>
      }
      expandedContent={<PHQ4AnswersTable answers={answers} showPips />}
    />
  );
}

function GCPSScoreCard({ title, manualAnchor, answers }: {
  title: string;
  manualAnchor?: string;
  answers: GCPS1MAnswers;
}) {
  const gcpsScore = calculateGCPS1MScore(answers);

  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      determinationOptions={GCPS_DETERMINATION_OPTIONS}
      scoreDisplay={
        <div className="text-right">
          <div className="flex gap-4">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                CSI
                <Popover>
                  <PopoverTrigger
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <Info className="h-3 w-3" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto text-[11px] text-muted-foreground p-3">
                    <div className="flex items-center gap-0.5">
                      <span>CSI =</span>
                      <span className="inline-flex flex-col items-center leading-[1.1]">
                        <span>Frage 2 + 3 + 4</span>
                        <span className="border-t border-current w-full text-center">3</span>
                      </span>
                      <span>× 10</span>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-xl font-bold leading-tight">
                {gcpsScore.cpi}
                <span className="text-sm text-muted-foreground font-normal">/100</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                BP
                <Popover>
                  <PopoverTrigger
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    <Info className="h-3 w-3" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto text-[11px] text-muted-foreground p-3 space-y-1">
                    <div>BP = BP Beeinträchtigung + BP Beeinträchtigungstage</div>
                    <div className="flex items-center gap-0.5">
                      <span>BP Beeinträchtigung =</span>
                      <span className="inline-flex flex-col items-center leading-[1.1]">
                        <span>Frage 6 + 7 + 8</span>
                        <span className="border-t border-current w-full text-center">3</span>
                      </span>
                      <span>× 10 → Punkte</span>
                    </div>
                    <div>
                      BP Tage = Frage 5 (0–1→0, 2→1, 3–5→2, ≥6→3)
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-xl font-bold leading-tight">
                {gcpsScore.totalDisabilityPoints}
                <span className="text-sm text-muted-foreground font-normal">/6</span>
              </div>
            </div>
          </div>
        </div>
      }
      expandedContent={<GCPSAnswersTable answers={answers} showPips />}
    />
  );
}

function JFLS8ScoreCard({ title, manualAnchor, answers }: {
  title: string;
  manualAnchor?: string;
  answers: JFLS8Answers;
}) {
  const jflsScore = calculateJFLS8Score(answers);

  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      scoreDisplay={
        <div className="text-right">
          {jflsScore.isValid && jflsScore.globalScore !== null ? (
            <div className="text-xl font-bold leading-tight">
              <span className="text-sm text-muted-foreground font-normal">⌀ </span>
              {jflsScore.globalScore.toFixed(2)}
              <span className="text-sm text-muted-foreground font-normal">
                /{jflsScore.maxScore}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">
              Zu viele fehlende Antworten ({jflsScore.missingCount}/8)
            </span>
          )}
        </div>
      }
      expandedContent={<JFLS8AnswersTable answers={answers} showPips />}
    />
  );
}

function JFLS20ScoreCard({ title, manualAnchor, answers }: {
  title: string;
  manualAnchor?: string;
  answers: JFLS20Answers;
}) {
  const jflsScore = calculateJFLS20Score(answers);

  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      scoreDisplay={
        <div className="text-right">
          {jflsScore.isValid && jflsScore.globalScore !== null ? (
            <>
              <div className="text-xl font-bold leading-tight">
                <span className="text-sm text-muted-foreground font-normal">⌀ </span>
                {jflsScore.globalScore.toFixed(2)}
                <span className="text-sm text-muted-foreground font-normal">
                  /{jflsScore.maxScore}
                </span>
              </div>
              <div className="text-xs space-y-0.5 mt-1">
                <JFLS20SubscaleDisplay
                  label={JFLS20_SUBSCALE_LABELS.mastication.label}
                  subscale={jflsScore.subscales.mastication}
                />
                <JFLS20SubscaleDisplay
                  label={JFLS20_SUBSCALE_LABELS.mobility.label}
                  subscale={jflsScore.subscales.mobility}
                />
                <JFLS20SubscaleDisplay
                  label={JFLS20_SUBSCALE_LABELS.communication.label}
                  subscale={jflsScore.subscales.communication}
                />
              </div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              Zu viele fehlende Antworten ({jflsScore.missingCount}/20)
            </span>
          )}
        </div>
      }
      expandedContent={<JFLS20AnswersTable answers={answers} showPips />}
    />
  );
}

function OBCScoreCard({ title, manualAnchor, answers }: {
  title: string;
  manualAnchor?: string;
  answers: OBCAnswers;
}) {
  const obcScore = calculateOBCScore(answers);

  return (
    <ScoreCardLayout
      title={title}
      manualAnchor={manualAnchor}
      scoreDisplay={
        <div className="text-right">
          <div className="text-xl font-bold leading-tight">
            {obcScore.totalScore}
            <span className="text-sm text-muted-foreground font-normal">
              /{obcScore.maxScore}
            </span>
          </div>
        </div>
      }
      expandedContent={<OBCAnswersTable answers={answers} showPips />}
    />
  );
}

// ─── Main entry point ───────────────────────────────────────────────────

interface Axis2ScoreCardProps {
  questionnaireId: string;
  title: string;
  answers: Record<string, string | number> | null;
  isPlaceholder?: boolean;
}

export function Axis2ScoreCard({
  questionnaireId,
  title,
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
          <div className="flex items-start justify-between gap-4">
            <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">
              {isPlaceholder ? "Demnächst verfügbar" : "Keine Daten"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.PHQ4) {
    const score = calculatePHQ4Score(answers as Record<string, string>);
    return (
      <PHQ4ScoreCard
        title={title}
        manualAnchor={manualAnchor}
        score={score}
        answers={answers as Record<string, string>}
      />
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.GCPS_1M) {
    return (
      <GCPSScoreCard
        title={title}
        manualAnchor={manualAnchor}
        answers={answers as GCPS1MAnswers}
      />
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.JFLS8) {
    return (
      <JFLS8ScoreCard
        title={title}
        manualAnchor={manualAnchor}
        answers={answers as JFLS8Answers}
      />
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.JFLS20) {
    return (
      <JFLS20ScoreCard
        title={title}
        manualAnchor={manualAnchor}
        answers={answers as JFLS20Answers}
      />
    );
  }

  if (questionnaireId === QUESTIONNAIRE_ID.OBC) {
    return (
      <OBCScoreCard
        title={title}
        manualAnchor={manualAnchor}
        answers={answers as OBCAnswers}
      />
    );
  }

  return (
    <Card>
      <div className="p-4">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">Bewertung nicht verfügbar</p>
      </div>
    </Card>
  );
}
