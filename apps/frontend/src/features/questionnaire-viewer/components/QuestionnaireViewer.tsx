/**
 * Main questionnaire viewer component with tabs for each questionnaire
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "@/lib/date-utils";
import { ClipboardList } from "lucide-react";
import {
  QUESTIONNAIRE_TITLES,
  SQ_OFFICE_USE_QUESTIONS,
  SQ_QUESTION_LABELS,
  SQ_SECTIONS_ORDER,
} from "../data/questionLabels";
import { isQuestionEnabled } from "../data/sqEnableWhen";
import {
  useQuestionnaireResponses,
  type QuestionnaireResponse,
} from "../hooks/useQuestionnaireResponses";
import { useUpdateQuestionnaireResponse } from "../hooks/useUpdateQuestionnaireResponse";
import { type OfficeUseValue } from "./editors/SideCheckboxGroup";
import { InlineQuestionItem, getAnswerType } from "./InlineQuestionItem";
import { OfficeUseQuestionItem } from "./OfficeUseQuestionItem";
import { PHQ4Summary } from "./PHQ4Summary";
import { QuestionItem } from "./QuestionItem";

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
              <QuestionnaireTabContent response={response} patientRecordId={patientRecordId} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface QuestionnaireTabContentProps {
  response: QuestionnaireResponse;
  patientRecordId: string;
}

function QuestionnaireTabContent({ response, patientRecordId }: QuestionnaireTabContentProps) {
  const { questionnaireId, answers, submittedAt } = response;

  return (
    <div>
      {/* Submission info */}
      <div className="text-sm text-muted-foreground mb-4">
        Eingereicht {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
      </div>

      {/* Questionnaire-specific rendering */}
      {questionnaireId === "phq-4" && <PHQ4Content answers={answers as Record<string, string>} />}
      {questionnaireId === "dc-tmd-sq" && (
        <SQContent response={response} patientRecordId={patientRecordId} />
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
 * DC/TMD-SQ content grouped by section with inline editing
 * SQ8-SQ14 have Office use fields for clinical confirmation
 */
function SQContent({
  response,
  patientRecordId,
}: {
  response: QuestionnaireResponse;
  patientRecordId: string;
}) {
  const { answers, id: responseId, questionnaireId, questionnaireVersion } = response;
  const updateMutation = useUpdateQuestionnaireResponse(patientRecordId);

  // Define question order for proper sorting
  const QUESTION_ORDER = [
    "SQ1",
    "SQ2",
    "SQ3",
    "SQ4_A",
    "SQ4_B",
    "SQ4_C",
    "SQ4_D",
    "SQ5",
    "SQ6",
    "SQ7_A",
    "SQ7_B",
    "SQ7_C",
    "SQ7_D",
    "SQ8",
    "SQ9",
    "SQ10",
    "SQ11",
    "SQ12",
    "SQ13",
    "SQ14",
  ];

  // Group questions by section, showing only enabled questions
  // This includes questions without answers if they become enabled
  const answersBySection: Record<string, Array<{ id: string; answer: unknown }>> = {};

  // Get all question IDs from labels and filter by enableWhen
  Object.entries(SQ_QUESTION_LABELS).forEach(([questionId, label]) => {
    // Check if question is enabled based on current answers
    if (!isQuestionEnabled(questionId, answers)) return;

    // Get the answer (may be undefined for newly enabled questions)
    const answer = answers[questionId];

    if (!answersBySection[label.section]) {
      answersBySection[label.section] = [];
    }
    answersBySection[label.section].push({ id: questionId, answer });
  });

  // Sort questions within each section by predefined order
  Object.values(answersBySection).forEach((sectionAnswers) => {
    sectionAnswers.sort((a, b) => {
      const orderA = QUESTION_ORDER.indexOf(a.id);
      const orderB = QUESTION_ORDER.indexOf(b.id);
      return orderA - orderB;
    });
  });

  const handleSave = async (questionId: string, newValue: unknown) => {
    // Build the updated response_data with the new answer
    const updatedAnswers: Record<string, unknown> = {
      ...answers,
      [questionId]: newValue,
    };

    // If changing an office-use question to "no", also clear the office use
    if (SQ_OFFICE_USE_QUESTIONS.has(questionId) && newValue === "no") {
      const officeUseKey = `${questionId}_office`;
      updatedAnswers[officeUseKey] = {};
    }

    const updatedResponseData = {
      questionnaire_id: questionnaireId,
      questionnaire_version: questionnaireVersion,
      answers: updatedAnswers,
    };

    await updateMutation.mutateAsync({
      id: responseId,
      responseData: updatedResponseData,
    });
  };

  const handleOfficeUseChange = async (questionId: string, officeUse: OfficeUseValue) => {
    // Store office use as a nested object under "{questionId}_office"
    const officeUseKey = `${questionId}_office`;
    const updatedAnswers = {
      ...answers,
      [officeUseKey]: officeUse,
    };

    const updatedResponseData = {
      questionnaire_id: questionnaireId,
      questionnaire_version: questionnaireVersion,
      answers: updatedAnswers,
    };

    await updateMutation.mutateAsync({
      id: responseId,
      responseData: updatedResponseData,
    });
  };

  // Get office use value for a question
  const getOfficeUse = (questionId: string): OfficeUseValue => {
    const officeUseKey = `${questionId}_office`;
    return (answers[officeUseKey] as OfficeUseValue) || {};
  };

  // Count pending confirmations (questions with Yes answer but no side confirmed)
  const pendingConfirmations = Array.from(SQ_OFFICE_USE_QUESTIONS).filter((qId) => {
    if (!isQuestionEnabled(qId, answers)) return false;
    if (answers[qId] !== "yes") return false;
    const officeUse = getOfficeUse(qId);
    return !officeUse.R && !officeUse.L && !officeUse.DNK;
  }).length;

  return (
    <div className="space-y-6">
      {/* Status banner for pending confirmations */}
      {pendingConfirmations > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-amber-600 font-medium text-sm">
            {pendingConfirmations} {pendingConfirmations === 1 ? "Frage benötigt" : "Fragen benötigen"} Seitenbestätigung
          </span>
        </div>
      )}

      {SQ_SECTIONS_ORDER.map((section) => {
        const sectionAnswers = answersBySection[section];
        if (!sectionAnswers || sectionAnswers.length === 0) return null;

        return (
          <div key={section}>
            {/* Section header */}
            <div className="mb-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {section}
              </h4>
            </div>
            <div className="border rounded-lg px-4">
              {sectionAnswers.map(({ id, answer }) => {
                const label = SQ_QUESTION_LABELS[id];
                const isOfficeUseQuestion = SQ_OFFICE_USE_QUESTIONS.has(id);

                if (isOfficeUseQuestion) {
                  return (
                    <OfficeUseQuestionItem
                      key={id}
                      questionId={id}
                      questionText={label?.text || id}
                      patientAnswer={answer as string}
                      officeUse={getOfficeUse(id)}
                      onPatientAnswerChange={handleSave}
                      onOfficeUseChange={handleOfficeUseChange}
                      isSaving={updateMutation.isPending}
                    />
                  );
                }

                return (
                  <InlineQuestionItem
                    key={id}
                    questionId={id}
                    questionText={label?.text || id}
                    answer={answer}
                    answerType={getAnswerType(id)}
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
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
