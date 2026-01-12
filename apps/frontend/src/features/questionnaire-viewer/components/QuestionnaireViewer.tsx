/**
 * Main questionnaire viewer component with tabs for each questionnaire
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";
import { useQuestionnaireResponses, type QuestionnaireResponse } from "../hooks/useQuestionnaireResponses";
import { QuestionItem } from "./QuestionItem";
import { PHQ4Summary } from "./PHQ4Summary";
import {
  SQ_QUESTION_LABELS,
  PHQ4_QUESTION_LABELS,
  PHQ4_ANSWER_LABELS,
  SQ_YES_NO_LABELS,
  SQ3_LABELS,
  QUESTIONNAIRE_TITLES,
  SQ_SECTIONS_ORDER,
} from "../data/questionLabels";
import { formatDistanceToNow } from "@/lib/date-utils";

interface QuestionnaireViewerProps {
  patientRecordId: string;
}

export function QuestionnaireViewer({ patientRecordId }: QuestionnaireViewerProps) {
  const { data, isLoading } = useQuestionnaireResponses(patientRecordId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fragebögen</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={data[0].questionnaireId}>
          <TabsList className="mb-4">
            {data.map((response) => (
              <TabsTrigger key={response.id} value={response.questionnaireId}>
                {QUESTIONNAIRE_TITLES[response.questionnaireId] || response.questionnaireId}
              </TabsTrigger>
            ))}
          </TabsList>

          {data.map((response) => (
            <TabsContent key={response.id} value={response.questionnaireId}>
              <QuestionnaireTabContent response={response} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface QuestionnaireTabContentProps {
  response: QuestionnaireResponse;
}

function QuestionnaireTabContent({ response }: QuestionnaireTabContentProps) {
  const { questionnaireId, answers, submittedAt } = response;

  return (
    <div>
      {/* Submission info */}
      <div className="text-sm text-muted-foreground mb-4">
        Eingereicht {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
      </div>

      {/* Questionnaire-specific rendering */}
      {questionnaireId === "phq-4" && (
        <PHQ4Content answers={answers as Record<string, string>} />
      )}
      {questionnaireId === "dc-tmd-sq" && (
        <SQContent answers={answers as Record<string, unknown>} />
      )}
      {questionnaireId !== "phq-4" && questionnaireId !== "dc-tmd-sq" && (
        <GenericContent answers={answers} />
      )}
    </div>
  );
}

/**
 * PHQ-4 specific content - table format with scoring
 */
function PHQ4Content({ answers }: { answers: Record<string, string> }) {
  return <PHQ4Summary answers={answers} />;
}

/**
 * DC/TMD-SQ content grouped by section
 */
function SQContent({ answers }: { answers: Record<string, unknown> }) {
  // Group answers by section
  const answersBySection: Record<string, Array<{ id: string; answer: unknown }>> = {};

  Object.entries(answers).forEach(([questionId, answer]) => {
    const label = SQ_QUESTION_LABELS[questionId];
    if (!label) return;

    if (!answersBySection[label.section]) {
      answersBySection[label.section] = [];
    }
    answersBySection[label.section].push({ id: questionId, answer });
  });

  return (
    <div className="space-y-6">
      {SQ_SECTIONS_ORDER.map((section) => {
        const sectionAnswers = answersBySection[section];
        if (!sectionAnswers || sectionAnswers.length === 0) return null;

        return (
          <div key={section}>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wide">
              {section}
            </h4>
            <div className="border rounded-lg px-4">
              {sectionAnswers.map(({ id, answer }) => {
                const label = SQ_QUESTION_LABELS[id];
                return (
                  <QuestionItem
                    key={id}
                    questionId={id}
                    questionText={label?.text || id}
                    answer={formatSQAnswer(id, answer)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Format SQ answer based on question type
 */
function formatSQAnswer(questionId: string, answer: unknown): string {
  // Composite number answer (years/months)
  if (typeof answer === "object" && answer !== null) {
    const composite = answer as { years?: number; months?: number };
    const parts: string[] = [];
    if (composite.years !== undefined && composite.years > 0) {
      parts.push(`${composite.years} Jahr${composite.years !== 1 ? "e" : ""}`);
    }
    if (composite.months !== undefined && composite.months > 0) {
      parts.push(`${composite.months} Monat${composite.months !== 1 ? "e" : ""}`);
    }
    return parts.length > 0 ? parts.join(", ") : "0";
  }

  // String answer
  if (typeof answer === "string") {
    // SQ3 specific labels
    if (questionId === "SQ3" && SQ3_LABELS[answer]) {
      return SQ3_LABELS[answer];
    }
    // Yes/No labels
    if (SQ_YES_NO_LABELS[answer]) {
      return SQ_YES_NO_LABELS[answer];
    }
    return answer;
  }

  return String(answer);
}

/**
 * Generic content for unknown questionnaire types
 */
function GenericContent({ answers }: { answers: Record<string, unknown> }) {
  return (
    <div className="space-y-0 border rounded-lg px-4">
      {Object.entries(answers).map(([questionId, answer]) => (
        <QuestionItem
          key={questionId}
          questionId={questionId}
          questionText={questionId}
          answer={String(answer)}
        />
      ))}
    </div>
  );
}
