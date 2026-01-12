import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { FormProvider } from "react-hook-form";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { execute } from "../graphql/execute";
import {
  validateInviteToken,
  submitPatientConsent,
  submitPatientPersonalData,
  submitQuestionnaireResponse,
  getPatientProgress,
} from "../queries/queries";
import { encryptPatientData } from "../crypto";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

// Questionnaire imports
import {
  SQWizard,
  useSQForm,
  loadProgress as loadSQProgress,
  filterEnabledAnswers,
  SQ_METADATA,
} from "../features/sq";
import type { SQAnswers } from "../features/sq";
import {
  PHQ4Wizard,
  usePHQ4Form,
  loadProgress as loadPHQ4Progress,
  PHQ4_METADATA,
} from "../features/phq4";
import type { PHQ4Answers } from "../features/phq4";

// Form components
import { PersonalDataForm } from "./-components/PersonalDataForm";
import type { PersonalDataFormValues } from "./-components/personalDataSchema";

// Consent constants - single source of truth
const CONSENT_TEXT =
  "Ich willige in die Erhebung und Verarbeitung meiner persönlichen Gesundheitsdaten zum Zweck der medizinischen Versorgung ein. Ich verstehe, dass meine Daten verschlüsselt und sicher gespeichert werden.";
const CONSENT_VERSION = "1.0";

interface PatientSearch {
  token?: string;
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): PatientSearch => {
    return {
      token: search.token as string,
    };
  },
  component: PatientFlowPage,
});

// Flow steps
type FlowStep =
  | "validate"
  | "consent"
  | "personal-data"
  | "questionnaire-sq"
  | "questionnaire-phq4"
  | "complete"
  | "declined";

function PatientFlowPage() {
  const { token } = Route.useSearch();

  const [step, setStep] = useState<FlowStep>("validate");
  const [publicKey, setPublicKey] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submissionError, setSubmissionError] = useState<string>("");
  const [pendingSubmission, setPendingSubmission] = useState<{
    questionnaire_id: string;
    questionnaire_version: string;
    answers: Record<string, unknown>;
    nextStep: FlowStep;
  } | null>(null);

  // Validate token and check progress mutation
  const validateTokenMutation = useMutation({
    mutationFn: async (inviteToken: string) => {
      // First validate the token
      const tokenResult = await execute(validateInviteToken, { invite_token: inviteToken });

      if (!tokenResult.validateInviteToken.valid || !tokenResult.validateInviteToken.public_key_pem) {
        return { tokenResult, progressResult: null };
      }

      // Then get patient progress to determine starting step
      const progressResult = await execute(getPatientProgress, { invite_token: inviteToken });
      return { tokenResult, progressResult };
    },
    onSuccess: ({ tokenResult, progressResult }) => {
      if (
        tokenResult.validateInviteToken.valid &&
        tokenResult.validateInviteToken.public_key_pem
      ) {
        setPublicKey(tokenResult.validateInviteToken.public_key_pem);
        setOrganizationName(tokenResult.validateInviteToken.organization_name || "");
        setError("");

        // Determine starting step based on progress
        if (progressResult?.getPatientProgress) {
          const progress = progressResult.getPatientProgress;

          if (!progress.has_consent) {
            setStep("consent");
          } else if (!progress.consent_given) {
            // Consent was declined
            setStep("declined");
          } else if (!progress.has_personal_data) {
            setStep("personal-data");
          } else if (!progress.submitted_questionnaires.includes("dc-tmd-sq")) {
            setStep("questionnaire-sq");
          } else if (!progress.submitted_questionnaires.includes("phq-4")) {
            setStep("questionnaire-phq4");
          } else {
            // All complete
            setStep("complete");
          }
        } else {
          // No progress data, start from beginning
          setStep("consent");
        }
      } else {
        setError(
          tokenResult.validateInviteToken.error_message || "Ungültiger Einladungslink"
        );
      }
    },
    onError: (err) => {
      setError(
        err instanceof Error
          ? err.message
          : "Einladungslink konnte nicht überprüft werden"
      );
    },
  });

  // Consent mutation
  const consentMutation = useMutation({
    mutationFn: (consentData: {
      invite_token: string;
      consent_data: {
        consent_given: boolean;
        consent_text: string;
        consent_version: string;
      };
    }) => execute(submitPatientConsent, consentData),
    onSuccess: (data) => {
      if (data.submitPatientConsent.success) {
        setStep("personal-data");
        setError("");
      } else {
        setError(
          data.submitPatientConsent.error ||
            "Einwilligung konnte nicht übermittelt werden"
        );
      }
    },
    onError: (err) => {
      setError(
        err instanceof Error
          ? err.message
          : "Einwilligung konnte nicht übermittelt werden"
      );
    },
  });

  // Personal data mutation
  const personalDataMutation = useMutation({
    mutationFn: async (formData: PersonalDataFormValues) => {
      const encryptedPayload = await encryptPatientData(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
        },
        publicKey
      );

      return execute(submitPatientPersonalData, {
        invite_token: token!,
        patient_data: {
          first_name_encrypted: encryptedPayload,
          last_name_encrypted: encryptedPayload,
          date_of_birth_encrypted: encryptedPayload,
        },
      });
    },
    onSuccess: (data) => {
      if (data.submitPatientPersonalData.success) {
        setStep("questionnaire-sq");
        setError("");
      } else {
        setError(
          data.submitPatientPersonalData.error ||
            "Persönliche Daten konnten nicht übermittelt werden"
        );
      }
    },
    onError: (err) => {
      setError(
        err instanceof Error
          ? err.message
          : "Persönliche Daten konnten nicht übermittelt werden"
      );
    },
  });

  // Questionnaire submission mutation
  const questionnaireSubmitMutation = useMutation({
    mutationFn: (params: {
      questionnaire_id: string;
      questionnaire_version: string;
      answers: Record<string, unknown>;
    }) =>
      execute(submitQuestionnaireResponse, {
        invite_token: token!,
        questionnaire_id: params.questionnaire_id,
        questionnaire_version: params.questionnaire_version,
        answers: params.answers,
      }),
  });

  // Validate token on mount
  useEffect(() => {
    if (token && step === "validate") {
      validateTokenMutation.mutate(token);
    }
  }, [token]);

  // Handle consent submission
  const handleConsent = async (consentGiven: boolean) => {
    if (!token) return;

    await consentMutation.mutateAsync({
      invite_token: token,
      consent_data: {
        consent_given: consentGiven,
        consent_text: CONSENT_TEXT,
        consent_version: CONSENT_VERSION,
      },
    });

    if (!consentGiven) {
      setStep("declined");
    }
  };

  // Handle personal data submission
  const handlePersonalData = async (data: PersonalDataFormValues) => {
    await personalDataMutation.mutateAsync(data);
  };

  // Submit questionnaire and handle success/failure
  const submitQuestionnaire = async (
    submission: {
      questionnaire_id: string;
      questionnaire_version: string;
      answers: Record<string, unknown>;
    },
    nextStep: FlowStep
  ) => {
    setSubmissionError("");
    setPendingSubmission({ ...submission, nextStep });

    try {
      const result = await questionnaireSubmitMutation.mutateAsync(submission);

      if (result.submitQuestionnaireResponse.success) {
        setPendingSubmission(null);
        setStep(nextStep);
      } else {
        setSubmissionError(
          result.submitQuestionnaireResponse.error ||
            "Fragebogen konnte nicht übermittelt werden"
        );
      }
    } catch (err) {
      setSubmissionError(
        err instanceof Error
          ? err.message
          : "Fragebogen konnte nicht übermittelt werden"
      );
    }
  };

  // Retry pending submission
  const retrySubmission = () => {
    if (pendingSubmission) {
      const { nextStep, ...submission } = pendingSubmission;
      submitQuestionnaire(submission, nextStep);
    }
  };

  // Handle SQ completion
  const handleSQComplete = (answers: SQAnswers) => {
    submitQuestionnaire(
      {
        questionnaire_id: SQ_METADATA.id,
        questionnaire_version: SQ_METADATA.version,
        answers: answers as Record<string, unknown>,
      },
      "questionnaire-phq4"
    );
  };

  // Handle PHQ-4 completion
  const handlePHQ4Complete = (answers: PHQ4Answers) => {
    submitQuestionnaire(
      {
        questionnaire_id: PHQ4_METADATA.id,
        questionnaire_version: PHQ4_METADATA.version,
        answers: answers as Record<string, unknown>,
      },
      "complete"
    );
  };

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Kein Einladungslink vorhanden. Bitte verwenden Sie den Link, den
                Sie von Ihrem Gesundheitsdienstleister erhalten haben.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Questionnaire steps
  if (step === "questionnaire-sq" || step === "questionnaire-phq4") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-muted/30">
          <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Fragebogen {step === "questionnaire-sq" ? "1" : "2"}/2
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm font-medium">
                {step === "questionnaire-sq"
                  ? SQ_METADATA.title
                  : PHQ4_METADATA.title}
              </span>
            </div>
          </div>
        </header>

        {submissionError && (
          <div className="max-w-lg mx-auto px-4 mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{submissionError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retrySubmission}
                  disabled={questionnaireSubmitMutation.isPending}
                >
                  {questionnaireSubmitMutation.isPending
                    ? "Wird übermittelt..."
                    : "Erneut versuchen"}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <main>
          {step === "questionnaire-sq" && (
            <SQQuestionnaireWrapper
              token={token}
              onComplete={handleSQComplete}
            />
          )}
          {step === "questionnaire-phq4" && (
            <PHQ4QuestionnaireWrapper
              token={token}
              onComplete={handlePHQ4Complete}
            />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">Patienteninformation</h1>
            {organizationName && (
              <p className="text-muted-foreground mb-6">
                Organisation: {organizationName}
              </p>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Validate Step */}
            {step === "validate" && !error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Einladungslink wird überprüft...
                </p>
              </div>
            )}

            {/* Consent Step */}
            {step === "consent" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Schritt 1: Einwilligung
                </h2>
                <div className="bg-muted/50 p-4 rounded-md mb-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Bevor Sie fortfahren, lesen Sie bitte die folgende
                    Einwilligung und stimmen Sie zu:
                  </p>
                  <p className="text-sm font-medium">"{CONSENT_TEXT}"</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleConsent(true)}
                    disabled={consentMutation.isPending}
                    className="flex-1"
                  >
                    {consentMutation.isPending
                      ? "Wird übermittelt..."
                      : "Ich stimme zu"}
                  </Button>
                  <Button
                    onClick={() => handleConsent(false)}
                    disabled={consentMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    Ablehnen
                  </Button>
                </div>
              </div>
            )}

            {/* Personal Data Step */}
            {step === "personal-data" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Schritt 2: Persönliche Daten
                </h2>
                <PersonalDataForm
                  onSubmit={handlePersonalData}
                  isPending={personalDataMutation.isPending}
                />
              </div>
            )}

            {/* Declined Step */}
            {step === "declined" && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-amber-700 mb-4">
                  Einwilligung abgelehnt
                </h2>
                <p className="text-muted-foreground mb-6">
                  Sie haben die Einwilligung zur Erhebung und Verarbeitung Ihrer
                  persönlichen Gesundheitsdaten abgelehnt.
                </p>
                <p className="text-muted-foreground mb-6">
                  Ohne Einwilligung können wir den Patientenfragebogen nicht
                  fortsetzen.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Wenn Sie Ihre Meinung ändern, können Sie über denselben Link
                  zurückkehren und Ihre Einwilligung erteilen.
                </p>
                <Button onClick={() => setStep("consent")} variant="outline">
                  Zurück zur Einwilligung
                </Button>
              </div>
            )}

            {/* Complete Step */}
            {step === "complete" && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  Fertig!
                </h2>
                <p className="text-muted-foreground">
                  Vielen Dank für das Ausfüllen der Fragebögen. Ihre
                  Gesundheitsdienstleister werden Ihre Informationen überprüfen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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

  const handleComplete = (answers: SQAnswers) => {
    const filteredAnswers = filterEnabledAnswers(answers);
    onComplete(filteredAnswers);
  };

  return (
    <FormProvider {...methods}>
      <SQWizard
        token={token}
        initialIndex={savedProgress?.currentIndex}
        initialHistory={savedProgress?.history}
        onComplete={handleComplete}
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
