import { YES_NO_OPTIONS } from "../../model/answer";
import { QUESTIONNAIRE_ID } from "../../model/constants";
import { PAIN_TYPES } from "../../model/pain";
import type { ChoiceQuestion, EnableWhen, Question, QuestionContext } from "../../model/question";
import { buildInstanceId } from "../../model/questionInstance";
import { getE4PainTypes } from "../sections/e4-opening";
import { getE9PainTypes } from "../sections/e9-palpation";

/**
 * Creates a pain question.
 *
 * @param ctx - Question context (side, region, movement)
 * @param painType - Type of pain to ask about
 * @param enableWhen - Optional condition for when this question is enabled
 */
export function createPainQuestion(
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
 * Creates pain interview questions for E4 movement assessments.
 * Uses getE4PainTypes() as the source of truth for which pain types apply.
 */
export function painInterviewAfterMovement(ctx: QuestionContext): Question[] {
  if (!ctx.region) {
    return [createPainQuestion(ctx, PAIN_TYPES.PAIN), createPainQuestion(ctx, PAIN_TYPES.FAMILIAR)];
  }
  const painTypes = getE4PainTypes(ctx.region);
  return painTypes.map((painType) => createPainQuestion(ctx, painType));
}

/**
 * Creates pain interview questions for E9 palpation assessments.
 * Uses getE9PainTypes() as the source of truth for which pain types apply.
 */
export function painInterviewDuringPalpation(ctx: QuestionContext): Question[] {
  if (!ctx.region) {
    return [createPainQuestion(ctx, PAIN_TYPES.PAIN), createPainQuestion(ctx, PAIN_TYPES.FAMILIAR)];
  }
  const painTypes = getE9PainTypes(ctx.region);
  return painTypes.map((painType) => createPainQuestion(ctx, painType));
}
