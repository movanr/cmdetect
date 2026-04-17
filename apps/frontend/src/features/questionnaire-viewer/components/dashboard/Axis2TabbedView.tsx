/**
 * Axis 2 tabbed view — horizontal selector row above a paper-split detail panel.
 * Each tab card selects one questionnaire; the detail panel shows the patient's
 * answers on the left sheet and the practitioner's manual scoring form on the right.
 */

import { EmptyState } from "@/components/ui/empty-state";
import type { PainDrawingData } from "@/features/pain-drawing-evaluation";
import {
  PainDrawingAnswers,
  PainDrawingScoringContent,
} from "@/features/pain-drawing-evaluation";
import type {
  GCPS1MAnswers,
  JFLS20Answers,
  JFLS8Answers,
  OBCAnswers,
} from "@cmdetect/questionnaires";
import {
  isQuestionnaireEnabled,
  QUESTIONNAIRE_ID,
  QUESTIONNAIRE_TITLES,
} from "@cmdetect/questionnaires";
import { ClipboardList } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { SCORING_MANUAL_ANCHORS } from "../../content/dashboard-instructions";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import { Axis2DetailPanel } from "./Axis2DetailPanel";
import { Axis2TabCard } from "./Axis2TabCard";
import {
  JFLS20Content,
  JFLS8Content,
  OBCContent,
  PHQ4Content,
  type TabSummary,
} from "./Axis2ScoreCard";
import { GCPSScoringContent } from "./GCPSScoreCard";
import {
  GCPSAnswersTable,
  JFLS20AnswersTable,
  JFLS8AnswersTable,
  OBCAnswersTable,
  PHQ4AnswersTable,
} from "./questionnaire-tables";

interface TabDef {
  id: string;
  abbreviation: string;
}

const TAB_DEFS: TabDef[] = [
  { id: QUESTIONNAIRE_ID.PAIN_DRAWING, abbreviation: "Schmerzzeichnung" },
  { id: QUESTIONNAIRE_ID.GCPS_1M, abbreviation: "GCPS-1M" },
  { id: QUESTIONNAIRE_ID.PHQ4, abbreviation: "PHQ-4" },
  { id: QUESTIONNAIRE_ID.JFLS8, abbreviation: "JFLS-8" },
  { id: QUESTIONNAIRE_ID.JFLS20, abbreviation: "JFLS-20" },
  { id: QUESTIONNAIRE_ID.OBC, abbreviation: "OBC" },
];

function painDrawingCompleted(data: PainDrawingData | null | undefined): boolean {
  if (!data || !data.drawings) return false;
  return Object.values(data.drawings).some((d) => (d?.elements?.length ?? 0) > 0);
}

interface Axis2TabbedViewProps {
  responses: QuestionnaireResponse[];
  patientRecordId: string;
}

function AnswersEmpty() {
  return (
    <div className="py-6">
      <EmptyState
        icon={ClipboardList}
        title="Noch keine Antworten eingereicht"
        description="Manuelle Scoring-Eingabe ist weiterhin möglich (z. B. von Papierbogen)."
      />
    </div>
  );
}

export function Axis2TabbedView({ responses, patientRecordId }: Axis2TabbedViewProps) {
  const tabs = useMemo(() => TAB_DEFS.filter((t) => isQuestionnaireEnabled(t.id)), []);

  const [activeTab, setActiveTab] = useState<string | null>(QUESTIONNAIRE_ID.PAIN_DRAWING);
  const [summaries, setSummaries] = useState<Record<string, TabSummary>>({});

  const responseFor = useCallback(
    (id: string) => responses.find((r) => r.questionnaireId === id),
    [responses]
  );

  const toggle = (id: string) => setActiveTab((prev) => (prev === id ? null : id));

  const summarySetters = useMemo<Record<string, (summary: TabSummary) => void>>(() => {
    const map: Record<string, (summary: TabSummary) => void> = {};
    for (const tab of TAB_DEFS) {
      map[tab.id] = (summary) =>
        setSummaries((prev) => {
          const existing = prev[tab.id]?.entries ?? [];
          const next = summary.entries;
          if (
            existing.length === next.length &&
            existing.every((e, i) => e.label === next[i].label && e.value === next[i].value)
          ) {
            return prev;
          }
          return { ...prev, [tab.id]: summary };
        });
    }
    return map;
  }, []);

  const renderAnswers = (id: string) => {
    const response = responseFor(id);

    if (id === QUESTIONNAIRE_ID.PAIN_DRAWING) {
      const data = (response?.answers ?? null) as PainDrawingData | null;
      return <PainDrawingAnswers data={data} />;
    }

    if (!response || Object.keys(response.answers).length === 0) return <AnswersEmpty />;
    switch (id) {
      case QUESTIONNAIRE_ID.GCPS_1M:
        return <GCPSAnswersTable answers={response.answers as GCPS1MAnswers} showPips />;
      case QUESTIONNAIRE_ID.PHQ4:
        return (
          <PHQ4AnswersTable
            answers={response.answers as Record<string, string>}
            showPips
            showTotals
          />
        );
      case QUESTIONNAIRE_ID.JFLS8:
        return (
          <JFLS8AnswersTable answers={response.answers as JFLS8Answers} showPips showTotals />
        );
      case QUESTIONNAIRE_ID.JFLS20:
        return (
          <JFLS20AnswersTable answers={response.answers as JFLS20Answers} showPips showTotals />
        );
      case QUESTIONNAIRE_ID.OBC:
        return <OBCAnswersTable answers={response.answers as OBCAnswers} showPips showTotals />;
      default:
        return <AnswersEmpty />;
    }
  };

  return (
    <div className="space-y-0">
      {/* Tab row */}
      <div className="flex flex-wrap gap-2 items-stretch">
        {tabs.map((tab) => {
          const response = responseFor(tab.id);
          const completed =
            tab.id === QUESTIONNAIRE_ID.PAIN_DRAWING
              ? painDrawingCompleted(response?.answers as PainDrawingData | undefined)
              : !!response && Object.keys(response.answers).length > 0;
          const summary = summaries[tab.id];
          return (
            <Axis2TabCard
              key={tab.id}
              abbreviation={tab.abbreviation}
              entries={summary?.entries ?? []}
              active={activeTab === tab.id}
              completed={completed}
              onClick={() => toggle(tab.id)}
              emptyLabel="Bewertung ausstehend"
            />
          );
        })}
      </div>

      {/* Detail panels — all mounted to preserve per-questionnaire local state across switches.
          Only the active one is visible; outer wrapper is hidden entirely when no tab is active. */}
      <div className={activeTab ? "pt-4" : "hidden"}>
        {tabs.map((tab) => {
          const response = responseFor(tab.id);
          const hasResponse =
            tab.id === QUESTIONNAIRE_ID.PAIN_DRAWING
              ? painDrawingCompleted(response?.answers as PainDrawingData | undefined)
              : !!response && Object.keys(response.answers).length > 0;
          return (
            <div key={tab.id} className={activeTab === tab.id ? "block" : "hidden"}>
              <Axis2DetailPanel
                manualAnchor={SCORING_MANUAL_ANCHORS[tab.id]}
                split={tab.id === QUESTIONNAIRE_ID.GCPS_1M ? "balanced" : "default"}
                leftTitle={QUESTIONNAIRE_TITLES[tab.id] ?? tab.abbreviation}
                left={renderAnswers(tab.id)}
                right={renderScoring(
                  tab.id,
                  summarySetters[tab.id],
                  patientRecordId,
                  hasResponse
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderScoring(
  id: string,
  onSummaryChange: (summary: TabSummary) => void,
  patientRecordId: string,
  hasResponse: boolean
) {
  const shared = { onSummaryChange, patientRecordId, hasResponse };
  switch (id) {
    case QUESTIONNAIRE_ID.PAIN_DRAWING:
      return <PainDrawingScoringContent {...shared} />;
    case QUESTIONNAIRE_ID.GCPS_1M:
      return <GCPSScoringContent {...shared} />;
    case QUESTIONNAIRE_ID.PHQ4:
      return <PHQ4Content {...shared} />;
    case QUESTIONNAIRE_ID.JFLS8:
      return <JFLS8Content {...shared} />;
    case QUESTIONNAIRE_ID.JFLS20:
      return <JFLS20Content {...shared} />;
    case QUESTIONNAIRE_ID.OBC:
      return <OBCContent {...shared} />;
    default:
      return null;
  }
}
