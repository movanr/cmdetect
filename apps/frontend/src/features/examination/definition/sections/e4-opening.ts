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
import { MEASUREMENT_IDS } from "../../model/measurement";
import { MOVEMENTS } from "../../model/movement";
import { PAIN_TYPES } from "../../model/pain";
import type {
  BooleanQuestion,
  ChoiceQuestion,
  EnableWhen,
  NumericQuestion,
  Question,
  QuestionContext,
} from "../../model/question";
import { buildInstanceId } from "../../model/questionInstance";
import { REGIONS } from "../../model/region";
import { type SemanticId } from "../../model/semanticId";
import { SIDES } from "../../model/side";

const QUESTIONNAIRE_ID = "examination";

/**
 * Regions assessed for pain during opening movements (E4).
 * These are the general regions (not palpation zones).
 */
const E4_PAIN_REGIONS = [
  REGIONS.TEMPORALIS,
  REGIONS.MASSETER,
  REGIONS.TMJ,
  REGIONS.OTHER_MAST,
  REGIONS.NON_MAST,
] as const;

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
 * For each side × region combination, generates:
 * - Pain (always asked)
 * - Familiar pain (asked if pain = yes)
 * - Familiar headache (asked if pain = yes AND region = temporalis)
 */
function createPainInterviewForMovement(
  movement: (typeof MOVEMENTS)[keyof typeof MOVEMENTS]
): Question[] {
  const questions: Question[] = [];

  for (const side of Object.values(SIDES)) {
    for (const region of E4_PAIN_REGIONS) {
      const ctx: QuestionContext = { movement, side, region };

      // Pain question - always enabled
      const painQ = createPainQuestion(ctx, PAIN_TYPES.PAIN);
      questions.push(painQ);

      // EnableWhen: pain = yes
      const enableWhenPain: EnableWhen = {
        dependsOn: { semanticId: PAIN_TYPES.PAIN, scope: "local" },
        operator: "equals",
        value: ANSWER_VALUES.YES,
      };

      // Familiar pain - enabled when pain = yes
      questions.push(createPainQuestion(ctx, PAIN_TYPES.FAMILIAR, enableWhenPain));

      // Familiar headache - only for temporalis, enabled when pain = yes
      if (region === REGIONS.TEMPORALIS) {
        questions.push(createPainQuestion(ctx, PAIN_TYPES.FAMILIAR_HEADACHE, enableWhenPain));
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
