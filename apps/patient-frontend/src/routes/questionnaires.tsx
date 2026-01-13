/**
 * /questionnaires route - Combined questionnaire flow
 * Patient fills out all questionnaires in sequence
 */

import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";

// SQ imports
import {
  SQWizard,
  useSQForm,
  loadProgress as loadSQProgress,
  type SQAnswers,
} from "../features/sq";

// PHQ-4 imports
import {
  PHQ4Wizard,
  usePHQ4Form,
  loadProgress as loadPHQ4Progress,
  PHQ4_QUESTIONNAIRE,
  type PHQ4Answers,
} from "../features/phq4";

// GCPS-1M imports
import {
  GCPS1MWizard,
  useGCPS1MForm,
  loadProgress as loadGCPS1MProgress,
  GCPS_1M_QUESTIONNAIRE,
  type GCPS1MAnswers,
} from "../features/gcps-1m";

// JFLS-8 imports
import {
  JFLS8Wizard,
  useJFLS8Form,
  loadProgress as loadJFLS8Progress,
  JFLS8_QUESTIONNAIRE,
  type JFLS8Answers,
} from "../features/jfls8";

// Define the questionnaire sequence
const QUESTIONNAIRES = [
  { id: "sq", name: "Symptom Questionnaire", shortName: "SQ" },
  { id: "phq4", name: PHQ4_QUESTIONNAIRE.title, shortName: "PHQ-4" },
  { id: "gcps-1m", name: GCPS_1M_QUESTIONNAIRE.title, shortName: "GCPS" },
  { id: "jfls-8", name: JFLS8_QUESTIONNAIRE.title, shortName: "JFLS-8" },
] as const;

type QuestionnaireId = (typeof QUESTIONNAIRES)[number]["id"];

interface SearchParams {
  token?: string;
}

export const Route = createFileRoute("/questionnaires")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: QuestionnairesPage,
});

// Storage for tracking which questionnaire is current
const PROGRESS_KEY = "questionnaires_progress";

function saveOverallProgress(token: string, currentQuestionnaire: QuestionnaireId) {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({ token, currentQuestionnaire, timestamp: Date.now() })
  );
}

function loadOverallProgress(token: string): QuestionnaireId | null {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    if (data.token !== token) return null;
    // 24h expiry
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) return null;
    return data.currentQuestionnaire;
  } catch {
    return null;
  }
}

function clearOverallProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}

function QuestionnairesPage() {
  const { token } = Route.useSearch();
  const effectiveToken = token ?? "dev-token";

  // Track which questionnaire is active
  const savedQuestionnaire = loadOverallProgress(effectiveToken);
  const [currentQuestionnaireId, setCurrentQuestionnaireId] = useState<QuestionnaireId>(
    savedQuestionnaire ?? "sq"
  );

  // Track all completed answers
  const [allAnswers, setAllAnswers] = useState<{
    sq?: SQAnswers;
    phq4?: PHQ4Answers;
    "gcps-1m"?: GCPS1MAnswers;
    "jfls-8"?: JFLS8Answers;
  }>({});

  // Track if all questionnaires are complete
  const [isAllComplete, setIsAllComplete] = useState(false);

  // Get current questionnaire index
  const currentIndex = QUESTIONNAIRES.findIndex((q) => q.id === currentQuestionnaireId);
  const currentQuestionnaire = QUESTIONNAIRES[currentIndex];

  // Save progress when questionnaire changes
  useEffect(() => {
    if (!isAllComplete) {
      saveOverallProgress(effectiveToken, currentQuestionnaireId);
    }
  }, [effectiveToken, currentQuestionnaireId, isAllComplete]);

  // Handle questionnaire completion
  const handleQuestionnaireComplete = (questionnaireId: QuestionnaireId, answers: unknown) => {
    // Store answers
    setAllAnswers((prev) => ({
      ...prev,
      [questionnaireId]: answers,
    }));

    // Move to next questionnaire or finish
    const nextIndex = currentIndex + 1;
    if (nextIndex < QUESTIONNAIRES.length) {
      setCurrentQuestionnaireId(QUESTIONNAIRES[nextIndex].id);
    } else {
      // All complete
      setIsAllComplete(true);
      clearOverallProgress();
    }
  };

  // Show final completion screen
  if (isAllComplete) {
    return <AllQuestionnairesComplete answers={allAnswers} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Overall progress header */}
      <header className="border-b bg-muted/30">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Fragebogen {currentIndex + 1}/{QUESTIONNAIRES.length}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm font-medium">{currentQuestionnaire.name}</span>
          </div>
        </div>
      </header>

      {/* Render current questionnaire */}
      <main>
        {currentQuestionnaireId === "sq" && (
          <SQQuestionnaireWrapper
            token={effectiveToken}
            onComplete={(answers) => handleQuestionnaireComplete("sq", answers)}
          />
        )}
        {currentQuestionnaireId === "phq4" && (
          <PHQ4QuestionnaireWrapper
            token={effectiveToken}
            onComplete={(answers) => handleQuestionnaireComplete("phq4", answers)}
          />
        )}
        {currentQuestionnaireId === "gcps-1m" && (
          <GCPS1MQuestionnaireWrapper
            token={effectiveToken}
            onComplete={(answers) => handleQuestionnaireComplete("gcps-1m", answers)}
          />
        )}
        {currentQuestionnaireId === "jfls-8" && (
          <JFLS8QuestionnaireWrapper
            token={effectiveToken}
            onComplete={(answers) => handleQuestionnaireComplete("jfls-8", answers)}
          />
        )}
      </main>
    </div>
  );
}

/**
 * Wrapper for SQ questionnaire
 */
function SQQuestionnaireWrapper({
  token,
  onComplete,
}: {
  token: string;
  onComplete: (answers: SQAnswers) => void;
}) {
  const savedProgress = loadSQProgress(token);
  const methods = useSQForm({
    initialAnswers: savedProgress?.answers,
  });

  return (
    <FormProvider {...methods}>
      <SQWizard
        token={token}
        initialIndex={savedProgress?.currentIndex}
        initialHistory={savedProgress?.history}
        onComplete={onComplete}
      />
    </FormProvider>
  );
}

/**
 * Wrapper for PHQ-4 questionnaire
 */
function PHQ4QuestionnaireWrapper({
  token,
  onComplete,
}: {
  token: string;
  onComplete: (answers: PHQ4Answers) => void;
}) {
  const savedProgress = loadPHQ4Progress(token);
  const methods = usePHQ4Form(savedProgress?.answers);

  return (
    <FormProvider {...methods}>
      <PHQ4Wizard
        token={token}
        initialIndex={savedProgress?.currentIndex}
        onComplete={onComplete}
      />
    </FormProvider>
  );
}

/**
 * Wrapper for GCPS-1M questionnaire
 */
function GCPS1MQuestionnaireWrapper({
  token,
  onComplete,
}: {
  token: string;
  onComplete: (answers: GCPS1MAnswers) => void;
}) {
  const savedProgress = loadGCPS1MProgress(token);
  const methods = useGCPS1MForm(savedProgress?.answers);

  return (
    <FormProvider {...methods}>
      <GCPS1MWizard
        token={token}
        initialIndex={savedProgress?.currentIndex}
        onComplete={onComplete}
      />
    </FormProvider>
  );
}

/**
 * Wrapper for JFLS-8 questionnaire
 */
function JFLS8QuestionnaireWrapper({
  token,
  onComplete,
}: {
  token: string;
  onComplete: (answers: JFLS8Answers) => void;
}) {
  const savedProgress = loadJFLS8Progress(token);
  const methods = useJFLS8Form(savedProgress?.answers);

  return (
    <FormProvider {...methods}>
      <JFLS8Wizard
        token={token}
        initialIndex={savedProgress?.currentIndex}
        onComplete={onComplete}
      />
    </FormProvider>
  );
}

/**
 * Final completion screen when all questionnaires are done
 */
function AllQuestionnairesComplete({
  answers,
}: {
  answers: { sq?: SQAnswers; phq4?: PHQ4Answers; "gcps-1m"?: GCPS1MAnswers; "jfls-8"?: JFLS8Answers };
}) {
  const handleSubmit = () => {
    console.log("All questionnaires completed. Submitting:", answers);
    // TODO: Submit to backend via GraphQL mutation
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 py-12 space-y-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Alle Fragebögen abgeschlossen</h2>
              <p className="text-muted-foreground">
                Vielen Dank! Sie haben alle Fragebögen erfolgreich ausgefüllt.
              </p>
            </div>

            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              {QUESTIONNAIRES.map((q) => (
                <div key={q.id} className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{q.name}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Antworten absenden
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
