/**
 * Case Progress Hook
 *
 * Computes step completion status from case data.
 * This hook derives the completed steps from the case data without managing state itself.
 */

import { useMemo } from "react";
import { QUESTIONNAIRE_ID, type SQAnswers } from "@cmdetect/questionnaires";
import type { QuestionnaireResponse } from "../../questionnaire-viewer/hooks/useQuestionnaireResponses";
import { isStepComplete, MAIN_STEPS, type CaseData, type MainStep } from "../types/workflow";

interface UseCaseProgressOptions {
  patientRecordId: string;
  responses: QuestionnaireResponse[];
  hasPatientData: boolean;
  // Additional markers from patient_record table (future use)
  examinationCompletedAt?: string | null;
  evaluationCompletedAt?: string | null;
  documentationCompletedAt?: string | null;
  exportedAt?: string | null;
}

interface CaseProgressResult {
  caseData: CaseData;
  completedSteps: Set<MainStep>;
  isAnamnesisComplete: boolean;
  isScreeningNegative: boolean;
}

/**
 * Determines if the SQ screening is negative (all screening questions answered "no")
 */
function checkScreeningNegative(responses: QuestionnaireResponse[]): boolean {
  const sqResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);
  if (!sqResponse) return false;

  const sqAnswers = sqResponse.answers as SQAnswers | undefined;
  if (!sqAnswers) return false;

  // Screening questions: SQ1 (pain), SQ5 (headache), SQ8 (joint noises), SQ9 (closed locking), SQ13 (open locking)
  return (
    sqAnswers.SQ1 === "no" &&
    sqAnswers.SQ5 === "no" &&
    sqAnswers.SQ8 === "no" &&
    sqAnswers.SQ9 === "no" &&
    sqAnswers.SQ13 === "no"
  );
}

/**
 * Determines if the SQ has been reviewed (has reviewedAt timestamp)
 */
function getSqReviewedAt(responses: QuestionnaireResponse[]): string | null {
  const sqResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);
  if (!sqResponse) return null;

  // reviewedAt is set when the SQ wizard is completed
  return sqResponse.reviewedAt ?? null;
}

export function useCaseProgress(options: UseCaseProgressOptions): CaseProgressResult {
  const {
    patientRecordId,
    responses,
    hasPatientData,
    examinationCompletedAt = null,
    evaluationCompletedAt = null,
    documentationCompletedAt = null,
    exportedAt = null,
  } = options;

  return useMemo(() => {
    const isScreeningNegative = checkScreeningNegative(responses);
    const sqReviewedAt = getSqReviewedAt(responses);

    const caseData: CaseData = {
      patientRecordId,
      hasPatientData,
      responses,
      isScreeningNegative,
      sqReviewedAt,
      examinationCompletedAt,
      evaluationCompletedAt,
      documentationCompletedAt,
      exportedAt,
    };

    // Calculate completed steps
    const completedSteps = new Set<MainStep>();
    for (const step of MAIN_STEPS) {
      if (isStepComplete(step.id, caseData)) {
        completedSteps.add(step.id);
      }
    }

    const isAnamnesisComplete = completedSteps.has("anamnesis");

    return {
      caseData,
      completedSteps,
      isAnamnesisComplete,
      isScreeningNegative,
    };
  }, [
    patientRecordId,
    responses,
    hasPatientData,
    examinationCompletedAt,
    evaluationCompletedAt,
    documentationCompletedAt,
    exportedAt,
  ]);
}
