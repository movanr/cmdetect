/**
 * SQ Wizard View - Step-by-step section review with the patient
 *
 * Uses React Hook Form with Zod validation:
 * - handleSubmit() for final form validation
 * - trigger() for section-level validation on navigation
 * - Real-time validation with mode: "onChange"
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SQ_ENABLE_WHEN,
  SQ_OFFICE_USE_QUESTIONS,
  isQuestionIdEnabled,
  type SQQuestionId,
} from "@cmdetect/questionnaires";
import { useMemo, useState } from "react";
import { FormProvider } from "react-hook-form";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import { useSQReviewForm } from "../../hooks/useSQReviewForm";
import { useUpdateQuestionnaireResponse } from "../../hooks/useUpdateQuestionnaireResponse";
import type { SQFormValues, SQFieldKey } from "../../schema/sqZodSchemas";
import { filterEnabledAnswers, getEnabledSections } from "../../utils";
import { SQSectionStep } from "./SQSectionStep";
import { WizardNavigation } from "./WizardNavigation";

interface SQWizardViewProps {
  response: QuestionnaireResponse;
  patientRecordId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function SQWizardView({
  response,
  patientRecordId,
  onComplete,
  onCancel,
}: SQWizardViewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = useUpdateQuestionnaireResponse(patientRecordId);

  const { id: responseId, questionnaireId, questionnaireVersion } = response;

  // Create RHF form with Zod validation
  const methods = useSQReviewForm({
    initialAnswers: response.answers as SQFormValues,
  });

  // Watch all form values for dynamic section visibility
  const watchedAnswers = methods.watch();

  // Get sections that have at least one enabled question
  // This updates as user changes answers (e.g., changes SQ1 to "No")
  const enabledSections = useMemo(
    () => getEnabledSections(watchedAnswers),
    [watchedAnswers]
  );

  const currentSection = enabledSections[currentSectionIndex];
  const isFirstStep = currentSectionIndex === 0;
  const isLastStep = currentSectionIndex === enabledSections.length - 1;

  /**
   * Handle form submission using RHF's handleSubmit
   * Zod schema validates office-use confirmations automatically
   */
  const onSubmit = async (validData: SQFormValues) => {
    setIsSubmitting(true);

    try {
      // Filter out answers for disabled questions (based on enableWhen)
      // This is done ONLY on submit, not on each "No" click
      const enabledAnswers = filterEnabledAnswers(validData);

      // Submit to server with review metadata
      const updatedResponseData = {
        questionnaire_id: questionnaireId,
        questionnaire_version: questionnaireVersion,
        answers: enabledAnswers,
        _meta: {
          reviewed_at: new Date().toISOString(),
        },
      };

      await updateMutation.mutateAsync({
        id: responseId,
        responseData: updatedResponseData,
      });

      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Wrap submission with handleSubmit for Zod validation
   */
  const handleComplete = methods.handleSubmit(onSubmit);

  /**
   * Navigate to previous section
   */
  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  /**
   * Navigate to next section after validating current section
   * Uses trigger() to validate only the fields in the current section
   */
  const handleNext = async () => {
    if (!isLastStep && currentSection) {
      const values = methods.getValues();

      // Build list of fields to validate for current section
      const fieldsToValidate: SQFieldKey[] = [];

      for (const questionId of currentSection.questionIds) {
        // Skip if question is disabled by enableWhen
        if (!isQuestionIdEnabled(questionId as SQQuestionId, SQ_ENABLE_WHEN, values)) {
          continue;
        }

        // Add the question field
        fieldsToValidate.push(questionId as SQFieldKey);

        // Add office-use field if applicable and answer is "yes"
        if (SQ_OFFICE_USE_QUESTIONS.has(questionId)) {
          const answer = values[questionId as keyof SQFormValues];
          if (answer === "yes") {
            fieldsToValidate.push(`${questionId}_office` as SQFieldKey);
          }
        }
      }

      // Trigger validation for current section fields
      const isValid = await methods.trigger(fieldsToValidate);

      if (isValid) {
        setCurrentSectionIndex((prev) => prev + 1);
      }
    }
  };

  // Handle edge case: no enabled sections
  if (enabledSections.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Keine Fragen zur Überprüfung vorhanden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader>
          <CardTitle>Symptomfragebogen mit Patient überprüfen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current section content */}
          {currentSection && <SQSectionStep section={currentSection} />}

          {/* Navigation */}
          <WizardNavigation
            currentStep={currentSectionIndex}
            totalSteps={enabledSections.length}
            sectionName={currentSection?.name ?? ""}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onComplete={handleComplete}
            onCancel={onCancel}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </FormProvider>
  );
}
