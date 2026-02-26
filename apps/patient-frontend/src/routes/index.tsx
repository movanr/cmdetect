import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { FormProvider } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, AlertTriangle, Lock, ClipboardList, Check } from "lucide-react";
import { CMDetectLogo } from "../components/CMDetectLogo";
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

// Questionnaire engine
import {
  QUESTIONNAIRE_FLOW,
  getFlowItemById,
  getNextFlowItem,
  useQuestionnaireForm,
  GenericWizard,
  type GenericQuestionnaire,
  type TransitionPhase,
} from "../features/questionnaire-engine";

// SQ - kept separate due to enableWhen logic
import { SQWizard, useSQForm } from "../features/sq";
import type { SQAnswers } from "../features/sq";

// Pain Drawing - canvas-based drawing wizard
import { PainDrawingWizard } from "../features/pain-drawing";
import type { PainDrawingData, TransitionPhase as PainDrawingTransitionPhase } from "../features/pain-drawing";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";

// Form components
import { PersonalDataForm } from "./-components/PersonalDataForm";
import type { PersonalDataFormValues } from "./-components/personalDataSchema";

// Maps known English server error strings to German patient-facing messages
function translateServerError(error: string | null | undefined): string | null {
  if (!error) return null;
  const translations: Record<string, string> = {
    "Invalid invite link":
      "Ihr Einladungslink ist ungültig. Bitte kontaktieren Sie Ihre Praxis.",
    "Invite link has expired":
      "Ihr Einladungslink ist abgelaufen. Bitte kontaktieren Sie Ihre Praxis für einen neuen Link.",
    "Invalid or expired invite token":
      "Ihr Einladungslink ist abgelaufen. Bitte kontaktieren Sie Ihre Praxis für einen neuen Link.",
    "Organization encryption not configured":
      "Die Verschlüsselung für Ihre Praxis ist nicht konfiguriert. Bitte kontaktieren Sie Ihre Praxis.",
  };
  return translations[error] ?? error;
}

// Consent constants
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

// Flow steps - generated from config
type FlowStep =
  | "validate"
  | "consent"
  | "personal-data"
  | "questionnaire"
  | "complete"
  | "declined";

function PatientFlowPage() {
  const { token } = Route.useSearch();

  const [step, setStep] = useState<FlowStep>("validate");
  const [currentQuestionnaireId, setCurrentQuestionnaireId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submissionError, setSubmissionError] = useState<string>("");
  const [pendingSubmission, setPendingSubmission] = useState<{
    questionnaire_id: string;
    questionnaire_version: string;
    answers: Record<string, unknown>;
  } | null>(null);

  // Transition animation state
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>("active");
  const [nextQuestionnaireId, setNextQuestionnaireId] = useState<string | null>(null);

  // Completion type tracking (full vs early when SQ screening is negative)
  const [completionType, setCompletionType] = useState<"full" | "early">("full");

  // Ref to prevent double validation (React Strict Mode)
  const hasValidatedToken = useRef(false);

  // Validate token and check progress
  const validateTokenMutation = useMutation({
    mutationFn: async (inviteToken: string) => {
      const tokenResult = await execute(validateInviteToken, { invite_token: inviteToken });

      if (!tokenResult.validateInviteToken.valid || !tokenResult.validateInviteToken.public_key_pem) {
        return { tokenResult, progressResult: null };
      }

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
            setStep("declined");
          } else if (!progress.has_personal_data) {
            setStep("personal-data");
          } else {
            // Find first incomplete questionnaire using flow config
            const nextQuestionnaire = QUESTIONNAIRE_FLOW.find(
              (item) => !progress.submitted_questionnaires.includes(item.questionnaire.id)
            );

            if (nextQuestionnaire) {
              setCurrentQuestionnaireId(nextQuestionnaire.questionnaire.id);
              setStep("questionnaire");
            } else {
              setStep("complete");
            }
          }
        } else {
          setStep("consent");
        }
      } else {
        setError(
          translateServerError(tokenResult.validateInviteToken.error_message) || "Ungültiger Einladungslink"
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
          translateServerError(data.submitPatientConsent.error) ||
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
        invite_token: token ?? "",
        patient_data: {
          first_name_encrypted: encryptedPayload,
          last_name_encrypted: encryptedPayload,
          date_of_birth_encrypted: encryptedPayload,
        },
      });
    },
    onSuccess: (data) => {
      if (data.submitPatientPersonalData.success) {
        // Start first questionnaire
        const firstQuestionnaire = QUESTIONNAIRE_FLOW[0];
        setCurrentQuestionnaireId(firstQuestionnaire.questionnaire.id);
        setStep("questionnaire");
        setError("");
      } else {
        setError(
          translateServerError(data.submitPatientPersonalData.error) ||
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
        invite_token: token ?? "",
        questionnaire_id: params.questionnaire_id,
        questionnaire_version: params.questionnaire_version,
        answers: params.answers,
      }),
  });

  // Validate token on mount (with ref guard to prevent double execution in Strict Mode)
  useEffect(() => {
    if (token && step === "validate" && !hasValidatedToken.current) {
      hasValidatedToken.current = true;
      validateTokenMutation.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token - validateTokenMutation.mutate is stable

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

  // Submit empty questionnaires for early completion (SQ screening negative)
  const submitEmptyQuestionnaires = useCallback(
    async () => {
      // Get all questionnaires after SQ
      const sqIndex = QUESTIONNAIRE_FLOW.findIndex(
        (item) => item.questionnaire.id === QUESTIONNAIRE_ID.SQ
      );
      const remainingQuestionnaires = QUESTIONNAIRE_FLOW.slice(sqIndex + 1);

      // Submit empty responses for each remaining questionnaire
      for (const item of remainingQuestionnaires) {
        const { id, version } = item.questionnaire;
        await questionnaireSubmitMutation.mutateAsync({
          questionnaire_id: id,
          questionnaire_version: version ?? "1.0",
          answers: {}, // Empty answers
        });
      }
    },
    [questionnaireSubmitMutation]
  );

  // Generic questionnaire completion handler - memoized to avoid unnecessary re-renders
  const handleQuestionnaireComplete = useCallback(
    async (answers: Record<string, unknown>) => {
      if (!currentQuestionnaireId) return;

      const flowItem = getFlowItemById(currentQuestionnaireId);
      if (!flowItem) return;

      const { id, version } = flowItem.questionnaire;

      setSubmissionError("");
      setPendingSubmission({
        questionnaire_id: id,
        questionnaire_version: version ?? "1.0",
        answers,
      });

      try {
        const result = await questionnaireSubmitMutation.mutateAsync({
          questionnaire_id: id,
          questionnaire_version: version ?? "1.0",
          answers,
        });

        if (result.submitQuestionnaireResponse.success) {
          setPendingSubmission(null);

          // Check for early completion: SQ with all "no" screening answers
          // Screening questions: SQ1 (pain), SQ5 (headache), SQ8 (joint noises), SQ9 (closed locking), SQ13 (open locking)
          const sqAnswers = answers as SQAnswers;
          const isScreeningNegative =
            currentQuestionnaireId === QUESTIONNAIRE_ID.SQ &&
            sqAnswers.SQ1 === "no" &&
            sqAnswers.SQ5 === "no" &&
            sqAnswers.SQ8 === "no" &&
            sqAnswers.SQ9 === "no" &&
            sqAnswers.SQ13 === "no";

          if (isScreeningNegative) {
            // Submit empty responses for remaining questionnaires
            try {
              await submitEmptyQuestionnaires();
              setCompletionType("early");
              setNextQuestionnaireId(null); // Will trigger completion
              setTransitionPhase("completing");
              return;
            } catch (err) {
              // If empty submissions fail, continue with normal flow
              setSubmissionError(
                err instanceof Error
                  ? err.message
                  : "Fragebogen konnte nicht übermittelt werden"
              );
              return;
            }
          }

          // Normal flow: determine next questionnaire (or completion)
          const nextItem = getNextFlowItem(currentQuestionnaireId);
          if (nextItem) {
            setNextQuestionnaireId(nextItem.questionnaire.id);
          } else {
            setCompletionType("full");
            setNextQuestionnaireId(null); // Will trigger completion
          }

          // Start the transition animation sequence
          setTransitionPhase("completing");
        } else {
          setSubmissionError(
            translateServerError(result.submitQuestionnaireResponse.error) ||
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
    },
    [currentQuestionnaireId, questionnaireSubmitMutation, submitEmptyQuestionnaires]
  );

  // Retry pending submission
  const retrySubmission = () => {
    if (pendingSubmission) {
      handleQuestionnaireComplete(pendingSubmission.answers);
    }
  };

  // Handle transition phase completion
  const handleTransitionPhaseComplete = useCallback(
    (completedPhase: TransitionPhase) => {
      if (completedPhase === "completing") {
        setTransitionPhase("success");
      } else if (completedPhase === "success") {
        setTransitionPhase("exiting");
        // Small delay before switching questionnaire for exit animation
        setTimeout(() => {
          if (nextQuestionnaireId) {
            setCurrentQuestionnaireId(nextQuestionnaireId);
            setNextQuestionnaireId(null);
          } else {
            setStep("complete");
          }
          // Reset to active phase after transition
          setTimeout(() => setTransitionPhase("active"), 35);
        }, 210);
      }
    },
    [nextQuestionnaireId]
  );

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

  // Questionnaire step
  if (step === "questionnaire" && currentQuestionnaireId) {
    const flowItem = getFlowItemById(currentQuestionnaireId);
    if (!flowItem) return null;

    const questionnaireIndex = QUESTIONNAIRE_FLOW.findIndex(
      (item) => item.questionnaire.id === currentQuestionnaireId
    );
    const questionnaireNumber = questionnaireIndex + 1;
    const totalQuestionnaires = QUESTIONNAIRE_FLOW.length;
    const { title } = flowItem.questionnaire;

    // Pain Drawing uses full viewport - render without outer chrome
    if (currentQuestionnaireId === QUESTIONNAIRE_ID.PAIN_DRAWING) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionnaireId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <PainDrawingWrapper
              transitionPhase={transitionPhase}
              onTransitionPhaseComplete={handleTransitionPhaseComplete}
              onComplete={handleQuestionnaireComplete}
            />
          </motion.div>
        </AnimatePresence>
      );
    }

    // Animation variants for content transitions
    const contentVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header bar - consistent with patient flow */}
        <header className="bg-background border-b">
          <div className="max-w-lg mx-auto px-4 py-4">
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              Fragebogen {questionnaireNumber} von {totalQuestionnaires}
            </p>
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

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionnaireId}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {flowItem.isCustom ? (
              // SQ uses its own wizard due to enableWhen logic
              <SQQuestionnaireWrapper
                token={token}
                transitionPhase={transitionPhase}
                onTransitionPhaseComplete={handleTransitionPhaseComplete}
                onComplete={(answers) =>
                  handleQuestionnaireComplete(answers as Record<string, unknown>)
                }
              />
            ) : (
              // All other questionnaires use the generic wizard
              <GenericQuestionnaireWrapper
                key={currentQuestionnaireId}
                questionnaire={flowItem.questionnaire}
                token={token}
                transitionPhase={transitionPhase}
                onTransitionPhaseComplete={handleTransitionPhaseComplete}
                onComplete={handleQuestionnaireComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* CMDetect Branding Footer */}
        <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <CMDetectLogo size={16} />
          <span>Powered by CMDetect</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            {/* Dynamic Header based on step */}
            {step === "consent" && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Willkommen</h1>
                {organizationName && (
                  <p className="text-muted-foreground mb-1">{organizationName}</p>
                )}
                <p className="text-sm text-muted-foreground">Schritt 1 von 3</p>
              </div>
            )}
            {step === "personal-data" && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Persönliche Daten</h1>
                <p className="text-sm text-muted-foreground">Schritt 2 von 3</p>
              </div>
            )}
            {step === "validate" && (
              <div className="mb-6">
                <p className="text-muted-foreground">Wird geladen...</p>
              </div>
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
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Bevor wir beginnen</h2>

                {/* Card 1: Encrypted Identity Data */}
                <div className="bg-muted/30 border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">Ihre Identität (verschlüsselt)</h3>
                      <p className="text-sm text-muted-foreground">
                        Ihr Name und Geburtsdatum werden mit Ende-zu-Ende-Verschlüsselung geschützt.
                        Die Daten werden bereits auf Ihrem Gerät verschlüsselt – nur Ihre Praxis kann sie entschlüsseln.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Questionnaire Data */}
                <div className="bg-muted/30 border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">Ihre Fragebogen-Antworten</h3>
                      <p className="text-sm text-muted-foreground">
                        Die medizinischen Angaben aus den Fragebögen werden sicher an Ihre Praxis übermittelt,
                        um Ihr Arztgespräch vorzubereiten.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Mit dem Fortfahren erklären Sie sich mit der Datenübermittlung einverstanden.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleConsent(true)}
                    disabled={consentMutation.isPending}
                    className="w-full"
                  >
                    {consentMutation.isPending
                      ? "Wird übermittelt..."
                      : "Ich stimme zu und fortfahren"}
                  </Button>
                  <Button
                    onClick={() => handleConsent(false)}
                    disabled={consentMutation.isPending}
                    variant="ghost"
                    className="w-full text-muted-foreground"
                  >
                    Ich möchte nicht teilnehmen
                  </Button>
                </div>

                {/* CMDetect Branding Footer */}
                <div className="pt-4 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <CMDetectLogo size={16} />
                  <span>Powered by CMDetect</span>
                </div>
              </div>
            )}

            {/* Personal Data Step */}
            {step === "personal-data" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Diese Daten werden verschlüsselt übermittelt.</span>
                </div>

                <PersonalDataForm
                  onSubmit={handlePersonalData}
                  isPending={personalDataMutation.isPending}
                />

                {/* CMDetect Branding Footer */}
                <div className="pt-4 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <CMDetectLogo size={16} />
                  <span>Powered by CMDetect</span>
                </div>
              </div>
            )}

            {/* Declined Step */}
            {step === "declined" && (
              <div className="text-center py-6 space-y-6">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-amber-600" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl font-bold text-amber-700">
                    Einwilligung abgelehnt
                  </h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <p className="text-muted-foreground">
                    Sie haben die Einwilligung zur Datenübermittlung abgelehnt.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ohne Einwilligung können wir den Patientenfragebogen nicht fortsetzen.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    Wenn Sie Ihre Meinung ändern, können Sie über denselben Link
                    zurückkehren und Ihre Einwilligung erteilen.
                  </p>
                  <Button onClick={() => setStep("consent")} variant="outline">
                    Zurück zur Einwilligung
                  </Button>
                </motion.div>

                {/* CMDetect Branding Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground"
                >
                  <CMDetectLogo size={16} />
                  <span>Powered by CMDetect</span>
                </motion.div>
              </div>
            )}

            {/* Complete Step */}
            {step === "complete" && (
              <div className="text-center py-6 space-y-6">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                </motion.div>

                <div className="space-y-2">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-green-700"
                  >
                    Vielen Dank!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground"
                  >
                    {completionType === "early"
                      ? "Basierend auf Ihren Antworten sind keine weiteren Fragen erforderlich."
                      : `Ihre Angaben wurden erfolgreich an ${organizationName || "Ihre Praxis"} übermittelt.`}
                  </motion.p>
                </div>

                {/* Summary Checklist */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border-t border-b py-4 space-y-2"
                >
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Persönliche Daten (verschlüsselt)</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>
                      {completionType === "early"
                        ? "Screening-Fragebogen abgeschlossen"
                        : `${QUESTIONNAIRE_FLOW.length} Fragebögen abgeschlossen`}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Ihr Gesundheitsdienstleister wird Ihre Informationen vor Ihrem Termin prüfen.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sie können dieses Fenster jetzt schließen.
                  </p>
                </motion.div>

                {/* CMDetect Branding Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="pt-4 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground"
                >
                  <CMDetectLogo size={16} />
                  <span>Powered by CMDetect</span>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Wrapper for SQ questionnaire (kept separate due to enableWhen logic)
 */
function SQQuestionnaireWrapper({
  token,
  transitionPhase,
  onTransitionPhaseComplete,
  onComplete,
}: {
  token: string;
  transitionPhase: TransitionPhase;
  onTransitionPhaseComplete: (phase: TransitionPhase) => void;
  onComplete: (answers: SQAnswers) => void;
}) {
  const methods = useSQForm();

  return (
    <FormProvider {...methods}>
      <SQWizard
        token={token}
        transitionPhase={transitionPhase}
        onTransitionPhaseComplete={onTransitionPhaseComplete}
        onComplete={onComplete}
      />
    </FormProvider>
  );
}

/**
 * Generic wrapper for all other questionnaires
 */
function GenericQuestionnaireWrapper({
  questionnaire,
  token,
  transitionPhase,
  onTransitionPhaseComplete,
  onComplete,
}: {
  questionnaire: GenericQuestionnaire;
  token: string;
  transitionPhase: TransitionPhase;
  onTransitionPhaseComplete: (phase: TransitionPhase) => void;
  onComplete: (answers: Record<string, unknown>) => void;
}) {
  const methods = useQuestionnaireForm();

  return (
    <FormProvider {...methods}>
      <GenericWizard
        questionnaire={questionnaire}
        token={token}
        transitionPhase={transitionPhase}
        onTransitionPhaseComplete={onTransitionPhaseComplete}
        onComplete={onComplete}
      />
    </FormProvider>
  );
}

/**
 * Wrapper for Pain Drawing wizard (canvas-based DC/TMD pain drawing)
 * Strips PNG exports before submission (only vector data is stored)
 */
function PainDrawingWrapper({
  transitionPhase,
  onTransitionPhaseComplete,
  onComplete,
}: {
  transitionPhase: TransitionPhase;
  onTransitionPhaseComplete: (phase: TransitionPhase) => void;
  onComplete: (data: Record<string, unknown>) => void;
}) {
  const handleComplete = (data: PainDrawingData) => {
    onComplete(data as unknown as Record<string, unknown>);
  };

  return (
    <PainDrawingWizard
      transitionPhase={transitionPhase as PainDrawingTransitionPhase}
      onTransitionPhaseComplete={onTransitionPhaseComplete as (phase: PainDrawingTransitionPhase) => void}
      onComplete={handleComplete}
    />
  );
}
