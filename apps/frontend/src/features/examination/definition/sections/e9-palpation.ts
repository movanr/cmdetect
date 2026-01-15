/**
 * E9 - Muscle & TMJ Palpation Section Definition
 *
 * Defines all questions for the E9 section of the DC-TMD examination:
 * - Temporalis palpation (3 zones × bilateral)
 * - Masseter palpation (3 zones × bilateral)
 * - TMJ palpation (2 zones × bilateral)
 */

import { ANSWER_VALUES, YES_NO_OPTIONS } from "../../model/answer";
import { QUESTIONNAIRE_ID } from "../../model/constants";
import { PAIN_TYPES, type PainType } from "../../model/pain";
import type { ChoiceQuestion, EnableWhen, Question, QuestionContext } from "../../model/question";
import { buildInstanceId } from "../../model/questionInstance";
import { REGIONS, type Region } from "../../model/region";
import { SIDES } from "../../model/side";

/**
 * Temporalis zones for E9 palpation (1.0 kg pressure).
 */
export const TEMPORALIS_ZONES = [
  REGIONS.TEMPORALIS_POST,
  REGIONS.TEMPORALIS_MEDIA,
  REGIONS.TEMPORALIS_ANT,
] as const;

/**
 * Masseter zones for E9 palpation (1.0 kg pressure).
 */
export const MASSETER_ZONES = [
  REGIONS.MASSETER_ORIGIN,
  REGIONS.MASSETER_BODY,
  REGIONS.MASSETER_INSERTION,
] as const;

/**
 * TMJ zones for E9 palpation.
 * - Lateral pole: 0.5 kg
 * - Around lateral pole: 1.0 kg
 */
export const TMJ_ZONES = [REGIONS.TMJ_LATERAL_POLE, REGIONS.TMJ_AROUND_LATERAL_POLE] as const;

/**
 * All E9 palpation zones.
 */
export const E9_ZONES = [...TEMPORALIS_ZONES, ...MASSETER_ZONES, ...TMJ_ZONES] as const;

/**
 * Pressure specifications for each zone (in kg).
 */
export const ZONE_PRESSURE: Record<Region, number> = {
  [REGIONS.TEMPORALIS_POST]: 1.0,
  [REGIONS.TEMPORALIS_MEDIA]: 1.0,
  [REGIONS.TEMPORALIS_ANT]: 1.0,
  [REGIONS.MASSETER_ORIGIN]: 1.0,
  [REGIONS.MASSETER_BODY]: 1.0,
  [REGIONS.MASSETER_INSERTION]: 1.0,
  [REGIONS.TMJ_LATERAL_POLE]: 0.5,
  [REGIONS.TMJ_AROUND_LATERAL_POLE]: 1.0,
  // Default for other regions (not used in E9)
  [REGIONS.TEMPORALIS]: 1.0,
  [REGIONS.MASSETER]: 1.0,
  [REGIONS.TMJ]: 0.5,
  [REGIONS.OTHER_MAST]: 0.5,
  [REGIONS.NON_MAST]: 0.5,
};

/**
 * Pain types for temporalis zones (includes familiar headache).
 */
export const TEMPORALIS_PAIN_TYPES = [
  PAIN_TYPES.PAIN,
  PAIN_TYPES.FAMILIAR,
  PAIN_TYPES.FAMILIAR_HEADACHE,
  PAIN_TYPES.SPREADING,
  PAIN_TYPES.REFERRED,
] as const;

/**
 * Pain types for masseter zones (no familiar headache).
 */
export const MASSETER_PAIN_TYPES = [
  PAIN_TYPES.PAIN,
  PAIN_TYPES.FAMILIAR,
  PAIN_TYPES.SPREADING,
  PAIN_TYPES.REFERRED,
] as const;

/**
 * Pain types for TMJ zones (no familiar headache, no spreading).
 */
export const TMJ_PAIN_TYPES = [PAIN_TYPES.PAIN, PAIN_TYPES.FAMILIAR, PAIN_TYPES.REFERRED] as const;

/**
 * Returns the pain types applicable for a given E9 zone.
 */
export function getE9PainTypes(zone: Region): readonly PainType[] {
  if (TEMPORALIS_ZONES.includes(zone as (typeof TEMPORALIS_ZONES)[number])) {
    return TEMPORALIS_PAIN_TYPES;
  }
  if (MASSETER_ZONES.includes(zone as (typeof MASSETER_ZONES)[number])) {
    return MASSETER_PAIN_TYPES;
  }
  if (TMJ_ZONES.includes(zone as (typeof TMJ_ZONES)[number])) {
    return TMJ_PAIN_TYPES;
  }
  // Fallback
  return [PAIN_TYPES.PAIN, PAIN_TYPES.FAMILIAR];
}

/**
 * Creates a pain presence question for E9 palpation.
 */
function createPainQuestion(
  ctx: QuestionContext,
  painType: PainType,
  enableWhen?: EnableWhen
): ChoiceQuestion {
  const semanticId = painType;
  return {
    questionnaireId: QUESTIONNAIRE_ID,
    semanticId,
    instanceId: buildInstanceId(QUESTIONNAIRE_ID, semanticId, ctx),
    type: "choice",
    context: ctx,
    multiple: false,
    answerOptions: YES_NO_OPTIONS,
    enableWhen,
  };
}

/**
 * Creates the pain interview questions for a single palpation zone.
 */
function createPainInterviewForZone(zone: Region): Question[] {
  const questions: Question[] = [];
  const painTypes = getE9PainTypes(zone);

  for (const side of Object.values(SIDES)) {
    const ctx: QuestionContext = { side, region: zone };

    for (const painType of painTypes) {
      // Pain question is always enabled
      if (painType === PAIN_TYPES.PAIN) {
        questions.push(createPainQuestion(ctx, painType));
        continue;
      }

      // Other pain types depend on pain = yes
      const enableWhen: EnableWhen = {
        dependsOn: { semanticId: PAIN_TYPES.PAIN, scope: "local" },
        operator: "equals",
        value: ANSWER_VALUES.YES,
      };

      questions.push(createPainQuestion(ctx, painType, enableWhen));
    }
  }

  return questions;
}

/**
 * Creates all questions for the E9 Palpation section.
 */
export function createE9Questions(): Question[] {
  const questions: Question[] = [];

  // Temporalis zones
  for (const zone of TEMPORALIS_ZONES) {
    questions.push(...createPainInterviewForZone(zone));
  }

  // Masseter zones
  for (const zone of MASSETER_ZONES) {
    questions.push(...createPainInterviewForZone(zone));
  }

  // TMJ zones
  for (const zone of TMJ_ZONES) {
    questions.push(...createPainInterviewForZone(zone));
  }

  return questions;
}

/**
 * E9 section metadata.
 */
export const E9_SECTION = {
  id: "E9",
  semanticId: "e9Palpation",
  title: "Muskel- und Kiefergelenk-Palpation",
  groups: [
    { name: "Temporalis", zones: TEMPORALIS_ZONES, pressure: 1.0 },
    { name: "Masseter", zones: MASSETER_ZONES, pressure: 1.0 },
    { name: "TMJ", zones: TMJ_ZONES, pressure: "varies" },
  ],
} as const;
