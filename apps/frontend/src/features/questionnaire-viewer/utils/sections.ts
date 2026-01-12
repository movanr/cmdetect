/**
 * Section filtering utilities for SQ questionnaire review
 */
import {
  SQ_SECTIONS,
  SQ_ENABLE_WHEN,
  isQuestionIdEnabled,
  type SQSection,
  type SQQuestionId,
  type SQSectionId,
} from "@cmdetect/questionnaires";
import type { QuestionnaireResponse } from "../hooks/useQuestionnaireResponses";

/**
 * Get sections that have at least one enabled question
 * Used to determine which sections to show in the wizard
 */
export function getEnabledSections(
  answers: Record<string, unknown>
): SQSection[] {
  return SQ_SECTIONS.filter((section) =>
    section.questionIds.some((qId) =>
      isQuestionIdEnabled(qId, SQ_ENABLE_WHEN, answers)
    )
  );
}

/**
 * Get enabled questions within a specific section
 * Filters out questions that are disabled due to skip logic
 */
export function getEnabledQuestionsInSection(
  sectionId: SQSectionId,
  answers: Record<string, unknown>
): SQQuestionId[] {
  const section = SQ_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return [];

  return section.questionIds.filter((qId) =>
    isQuestionIdEnabled(qId, SQ_ENABLE_WHEN, answers)
  );
}

/**
 * Get a section by its ID
 */
export function getSectionById(sectionId: SQSectionId): SQSection | undefined {
  return SQ_SECTIONS.find((s) => s.id === sectionId);
}

/**
 * Check if a questionnaire has been reviewed
 * Looks for _meta.reviewed_at in the response data
 */
export function isQuestionnaireReviewed(
  response: QuestionnaireResponse | undefined
): boolean {
  if (!response) return false;
  return !!(response as QuestionnaireResponseWithMeta).reviewedAt;
}

/**
 * Extended response type with review metadata
 */
export interface QuestionnaireResponseWithMeta extends QuestionnaireResponse {
  reviewedAt?: string;
  reviewedBy?: string;
}
