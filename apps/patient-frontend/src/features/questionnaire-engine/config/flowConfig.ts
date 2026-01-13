/**
 * Central flow configuration - single source of truth for questionnaire order
 */

import {
  PHQ4_QUESTIONNAIRE,
  GCPS_1M_QUESTIONNAIRE,
  JFLS8_QUESTIONNAIRE,
  JFLS20_QUESTIONNAIRE,
  OBC_QUESTIONNAIRE,
  SQ_METADATA,
} from "@cmdetect/questionnaires";
import type { QuestionnaireFlowItem, GenericQuestionnaire } from "../types";

// SQ is custom (uses its own wizard due to enableWhen logic)
// We create a minimal placeholder for flow tracking
const SQ_FLOW_PLACEHOLDER: GenericQuestionnaire = {
  id: SQ_METADATA.id,
  title: SQ_METADATA.title,
  version: SQ_METADATA.version,
  questions: [],
};

/**
 * Questionnaire flow order - determines sequence
 * Each item references the questionnaire from @cmdetect/questionnaires
 */
export const QUESTIONNAIRE_FLOW: QuestionnaireFlowItem[] = [
  { questionnaire: SQ_FLOW_PLACEHOLDER, isCustom: true },
  { questionnaire: PHQ4_QUESTIONNAIRE },
  { questionnaire: GCPS_1M_QUESTIONNAIRE },
  { questionnaire: JFLS8_QUESTIONNAIRE },
  { questionnaire: JFLS20_QUESTIONNAIRE },
  { questionnaire: OBC_QUESTIONNAIRE },
];

/**
 * Get flow item by questionnaire ID
 */
export function getFlowItemById(id: string): QuestionnaireFlowItem | undefined {
  return QUESTIONNAIRE_FLOW.find((item) => item.questionnaire.id === id);
}

/**
 * Get next flow item after the given questionnaire ID
 */
export function getNextFlowItem(
  currentId: string
): QuestionnaireFlowItem | undefined {
  const currentIndex = QUESTIONNAIRE_FLOW.findIndex(
    (item) => item.questionnaire.id === currentId
  );
  if (currentIndex >= 0 && currentIndex < QUESTIONNAIRE_FLOW.length - 1) {
    return QUESTIONNAIRE_FLOW[currentIndex + 1];
  }
  return undefined;
}

/**
 * Get all questionnaire IDs in flow order
 */
export function getFlowIds(): string[] {
  return QUESTIONNAIRE_FLOW.map((item) => item.questionnaire.id);
}

/**
 * Total number of questionnaires in flow
 */
export const TOTAL_QUESTIONNAIRES = QUESTIONNAIRE_FLOW.length;
