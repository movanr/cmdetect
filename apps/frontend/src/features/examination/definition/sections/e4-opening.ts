/**
 * E4 - Opening Movements Section Definition
 *
 * Defines all questions for the E4 section of the DC-TMD examination:
 * - Pain-free opening (measurement)
 * - Maximum unassisted opening (measurement + pain interview)
 * - Maximum assisted opening (measurement + pain interview)
 * - Terminated indicator
 */

import { ANSWER_VALUES, YES_NO_OPTIONS } from "../../model/answer";
import { QUESTIONNAIRE_ID } from "../../model/constants";
import { MEASUREMENT_IDS } from "../../model/measurement";
import { MOVEMENTS } from "../../model/movement";
import { PAIN_TYPES, type PainType } from "../../model/pain";
import type {
  BooleanQuestion,
  ChoiceQuestion,
  EnableWhen,
  NumericQuestion,
  Question,
  QuestionContext,
} from "../../model/question";
import { buildInstanceId } from "../../model/questionInstance";
import { REGIONS, type Region } from "../../model/region";
import { type SemanticId } from "../../model/semanticId";
import { SIDES } from "../../model/side";

/**
 * Regions assessed for pain during opening movements (E4).
 * These are the general regions (not palpation zones).
 */
export const E4_PAIN_REGIONS = [
  REGIONS.TEMPORALIS,
  REGIONS.MASSETER,
  REGIONS.TMJ,
  REGIONS.OTHER_MAST,
  REGIONS.NON_MAST,
] as const satisfies Region[];

/**
 * Returns the pain types applicable for a given E4 region.
 * - Temporalis: pain, familiar pain, familiar headache
 * - Others: pain, familiar pain
 */
export function getE4PainTypes(region: Region): readonly PainType[] {
  if (region === REGIONS.TEMPORALIS) {
    return [PAIN_TYPES.PAIN, PAIN_TYPES.FAMILIAR, PAIN_TYPES.FAMILIAR_HEADACHE];
  }
  return [PAIN_TYPES.PAIN, PAIN_TYPES.FAMILIAR];
}

/**
 * Creates a measurement question for opening distance.
 */
function createMeasurementQuestion(
  semanticId: SemanticId,
  ctx: QuestionContext = {}
): NumericQuestion {
  return {
    questionnaireId: QUESTIONNAIRE_ID,
    semanticId,
    instanceId: buildInstanceId(QUESTIONNAIRE_ID, semanticId, ctx),
    type: "numeric",
    context: ctx,
    min: 0,
    max: 100,
    unit: "mm",
  };
}

/**
 * Creates a boolean question for terminated indicator.
 */
function createTerminatedQuestion(
  movement: (typeof MOVEMENTS)[keyof typeof MOVEMENTS]
): BooleanQuestion {
  const semanticId = MEASUREMENT_IDS.TERMINATED;
  const ctx: QuestionContext = { movement };
  return {
    questionnaireId: QUESTIONNAIRE_ID,
    semanticId,
    instanceId: buildInstanceId(QUESTIONNAIRE_ID, semanticId, ctx),
    type: "boolean",
    context: ctx,
  };
}

/**
 * Creates a pain presence question.
 *
 * @param ctx - Question context (side, region, movement)
 * @param painType - Type of pain to ask about
 * @param enableWhen - Optional condition for when this question is enabled
 */
function createPainQuestion(
  ctx: QuestionContext,
  painType: (typeof PAIN_TYPES)[keyof typeof PAIN_TYPES],
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
 * Creates the pain interview questions for a single movement assessment.
 *
 * For each side × region combination, generates questions for the
 * applicable pain types (determined by getE4PainTypes).
 */
function createPainInterviewForMovement(
  movement: (typeof MOVEMENTS)[keyof typeof MOVEMENTS]
): Question[] {
  const questions: Question[] = [];

  for (const side of Object.values(SIDES)) {
    for (const region of E4_PAIN_REGIONS) {
      const ctx: QuestionContext = { movement, side, region };
      const painTypes = getE4PainTypes(region);

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
  }

  return questions;
}

/**
 * Creates all questions for the E4 Opening Movements section.
 */
export function createE4Questions(): Question[] {
  const questions: Question[] = [];

  // Pain-free opening measurement
  questions.push(createMeasurementQuestion(MEASUREMENT_IDS.PAIN_FREE_OPENING));

  // Maximum unassisted opening
  questions.push(createMeasurementQuestion(MOVEMENTS.MAX_UNASSISTED_OPENING));
  questions.push(createTerminatedQuestion(MOVEMENTS.MAX_UNASSISTED_OPENING));
  questions.push(...createPainInterviewForMovement(MOVEMENTS.MAX_UNASSISTED_OPENING));

  // Maximum assisted opening
  questions.push(createMeasurementQuestion(MOVEMENTS.MAX_ASSISTED_OPENING));
  questions.push(createTerminatedQuestion(MOVEMENTS.MAX_ASSISTED_OPENING));
  questions.push(...createPainInterviewForMovement(MOVEMENTS.MAX_ASSISTED_OPENING));

  return questions;
}

/**
 * E4 section metadata.
 */
export const E4_SECTION = {
  id: "E4",
  semanticId: "e4OpeningMovements",
  title: "Öffnungsbewegungen",
  measurements: [
    MEASUREMENT_IDS.PAIN_FREE_OPENING,
    MOVEMENTS.MAX_UNASSISTED_OPENING,
    MOVEMENTS.MAX_ASSISTED_OPENING,
  ] as const,
  movements: [MOVEMENTS.MAX_UNASSISTED_OPENING, MOVEMENTS.MAX_ASSISTED_OPENING] as const,
  regions: E4_PAIN_REGIONS,
} as const;
