/**
 * SQ (Achse 1) tabbed view — five section tabs over a single-pane detail panel.
 * Replaces the old SQStatusCard + full SQAnswersTable treatment. Tab summaries
 * are derived from the patient's answers; clicking a tab opens the filtered
 * question list for that section.
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { features } from "@/config/features";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
  isQuestionIdEnabled,
  SQ_ENABLE_WHEN,
  SQ_OFFICE_USE_QUESTIONS,
} from "@cmdetect/questionnaires";
import { Link } from "@tanstack/react-router";
import { AlertCircle, BookOpen, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { SCORING_MANUAL_ANCHORS } from "../../content/dashboard-instructions";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import type { TabSummaryEntry } from "./Axis2ScoreCard";
import { Axis2TabCard } from "./Axis2TabCard";
import { SQAnswersTable } from "./questionnaire-tables";
import {
  summarizeGelenkgeraeusche,
  summarizeKieferklemme,
  summarizeKiefersperre,
  summarizeKopfschmerzen,
  summarizeSchmerzen,
} from "./sq-summary";

type SQAnswers = Record<string, unknown>;

interface SQTabDef {
  id: string;
  /** Matches `SQ_QUESTION_LABELS[*].section` and is passed as `sectionFilter` to SQAnswersTable. */
  name: string;
  summarize: (answers: SQAnswers) => TabSummaryEntry[];
}

const SQ_TABS: SQTabDef[] = [
  { id: "pain", name: "Schmerzen", summarize: summarizeSchmerzen },
  { id: "headache", name: "Kopfschmerzen", summarize: summarizeKopfschmerzen },
  { id: "joint_noises", name: "Gelenkgeräusche", summarize: summarizeGelenkgeraeusche },
  { id: "closed_locking", name: "Kieferklemme", summarize: summarizeKieferklemme },
  { id: "open_locking", name: "Kiefersperre", summarize: summarizeKiefersperre },
];

/** Count SQ questions that need practitioner confirmation of the symptom side. */
function countPendingConfirmations(answers: SQAnswers): number {
  return Array.from(SQ_OFFICE_USE_QUESTIONS).filter((qId) => {
    if (!isQuestionIdEnabled(qId, SQ_ENABLE_WHEN, answers)) return false;
    if (answers[qId] !== "yes") return false;
    const officeUse = answers[`${qId}_office`] as
      | { R?: boolean; L?: boolean; DNK?: boolean }
      | undefined;
    return !officeUse?.R && !officeUse?.L && !officeUse?.DNK;
  }).length;
}

interface SQTabbedViewProps {
  response: QuestionnaireResponse | undefined;
  isScreeningNegative?: boolean;
  isReviewed?: boolean;
}

export function SQTabbedView({
  response,
  isScreeningNegative = false,
  isReviewed = false,
}: SQTabbedViewProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  if (!response) {
    return (
      <Card className="bg-muted/30 py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">SF - DC/TMD Symptomfragebogen</h4>
              <p className="text-sm text-muted-foreground mt-1">Noch nicht eingereicht</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { answers, submittedAt, reviewedAt } = response;
  const answerMap = answers as SQAnswers;
  const pendingConfirmations = isScreeningNegative ? 0 : countPendingConfirmations(answerMap);

  const toggle = (id: string) => setActiveTab((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col gap-3">
      {/* Status bar */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-medium">SF - DC/TMD Symptomfragebogen</h4>
          {isScreeningNegative ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Negativ
            </Badge>
          ) : isReviewed ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Überprüft
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Überprüfung mit Patient ausstehend
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Eingereicht {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
            {isReviewed && reviewedAt && (
              <> · Überprüft {formatDistanceToNow(new Date(reviewedAt), { addSuffix: true })}</>
            )}
          </p>
          {features.docsViewer && (
            <Link
              to="/docs/scoring-manual"
              hash={SCORING_MANUAL_ANCHORS["dc-tmd-sq"]}
              onClick={() => {
                sessionStorage.setItem("docs-return-url", window.location.pathname);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline"
            >
              <BookOpen className="h-3 w-3" />
              Scoring-Anleitung
            </Link>
          )}
        </div>

        {isScreeningNegative && (
          <p className="text-sm text-green-700">
            Alle 5 Screening-Fragen mit &quot;Nein&quot; beantwortet - keine CMD-Symptome.
          </p>
        )}

        {pendingConfirmations > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span>
              {pendingConfirmations}{" "}
              {pendingConfirmations === 1 ? "Frage benötigt" : "Fragen benötigen"} Bestätigung der
              Lokalisation
            </span>
          </div>
        )}
      </div>

      {/* Tab row */}
      <div className="flex flex-wrap gap-2 items-stretch">
        {SQ_TABS.map((tab) => (
          <Axis2TabCard
            key={tab.id}
            abbreviation={tab.name}
            entries={tab.summarize(answerMap)}
            active={activeTab === tab.id}
            completed
            onClick={() => toggle(tab.id)}
          />
        ))}
      </div>

      {/* Detail panels — all mounted; only the active one is visible */}
      <div className={activeTab ? "" : "hidden"}>
        {SQ_TABS.map((tab) => (
          <div key={tab.id} className={activeTab === tab.id ? "block" : "hidden"}>
            <section className="bg-card border rounded-md shadow-sm p-5 rounded-tl-none">
              <p className="text-sm font-medium mb-3">{tab.name}</p>
              <SQAnswersTable answers={answerMap} sectionFilter={tab.name} />
            </section>
          </div>
        ))}
      </div>
    </div>
  );
}
