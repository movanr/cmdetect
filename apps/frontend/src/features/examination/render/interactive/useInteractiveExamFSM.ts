/**
 * useInteractiveExamFSM - Finite state machine for interactive E4 examination.
 *
 * Manages the examination flow:
 * - IDLE: Waiting for region selection
 * - QUESTIONING: Asking pain interview questions for selected region
 *
 * Features:
 * - Early termination: If pain = no, skip follow-up questions
 * - Region status: Derives status from form data
 * - Progress tracking: Counts completed regions
 */

import { useState, useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { Movement } from "../../model/movement";
import { PAIN_TYPES } from "../../model/pain";
import { SIDES, type Side } from "../../model/side";
import { REGIONS, type Region } from "../../model/region";
import { buildInstanceId } from "../../model/questionInstance";
import { ANSWER_VALUES } from "../../model/answer";
import {
  type ExamStep,
  type RegionId,
  type InteractiveRegion,
  type RegionStatus,
  type ExamProgress,
  type QuestionType,
  INTERACTIVE_REGIONS,
  ALL_INTERACTIVE_REGIONS,
  TOTAL_REGIONS,
  getQuestionsForRegion,
  parseRegionId,
  buildRegionId,
} from "./types";

const QUESTIONNAIRE_ID = "examination";

/**
 * Map interactive region to the corresponding REGIONS constant.
 */
function mapToRegionConstant(region: InteractiveRegion): Region {
  switch (region) {
    case INTERACTIVE_REGIONS.TEMPORALIS:
      return REGIONS.TEMPORALIS;
    case INTERACTIVE_REGIONS.MASSETER:
      return REGIONS.MASSETER;
    case INTERACTIVE_REGIONS.TMJ:
      return REGIONS.TMJ;
    case INTERACTIVE_REGIONS.NON_MAST:
      return REGIONS.NON_MAST;
    case INTERACTIVE_REGIONS.OTHER_MAST:
      return REGIONS.OTHER_MAST;
  }
}

/**
 * Map question type to the corresponding PAIN_TYPES constant.
 */
function mapToPainType(questionType: QuestionType): string {
  switch (questionType) {
    case "pain":
      return PAIN_TYPES.PAIN;
    case "familiarPain":
      return PAIN_TYPES.FAMILIAR;
    case "familiarHeadache":
      return PAIN_TYPES.FAMILIAR_HEADACHE;
    default:
      return questionType;
  }
}

interface UseInteractiveExamFSMProps {
  movement: Movement;
}

interface UseInteractiveExamFSMReturn {
  /** Current FSM step */
  step: ExamStep;
  /** Status for all regions (both sides) */
  regionStatuses: Record<RegionId, RegionStatus>;
  /** Progress tracking */
  progress: ExamProgress;
  /** Current question being asked (if in QUESTIONING state) */
  currentQuestion: QuestionType | null;
  /** Total questions for current region */
  totalQuestionsForCurrentRegion: number;
  /** Handle region click - starts questioning for that region */
  handleRegionClick: (side: Side, region: InteractiveRegion) => void;
  /** Handle answer submission */
  handleAnswer: (answer: boolean) => void;
  /** Cancel current questioning (return to IDLE without saving) */
  handleCancel: () => void;
}

export function useInteractiveExamFSM({
  movement,
}: UseInteractiveExamFSMProps): UseInteractiveExamFSMReturn {
  const { watch, setValue } = useFormContext();
  const [step, setStep] = useState<ExamStep>({ type: "IDLE" });

  // Subscribe to all form changes to trigger re-renders when values change
  // This is needed because watch() inside memoized callbacks doesn't trigger re-renders
  const formValues = watch();

  // Build instance ID for a specific question
  const getInstanceId = useCallback(
    (side: Side, region: InteractiveRegion, questionType: QuestionType) => {
      const regionConstant = mapToRegionConstant(region);
      const painType = mapToPainType(questionType);
      return buildInstanceId(QUESTIONNAIRE_ID, painType, {
        movement,
        side,
        region: regionConstant,
      });
    },
    [movement]
  );

  // Calculate status for a single region
  const calculateRegionStatus = useCallback(
    (side: Side, region: InteractiveRegion): RegionStatus => {
      const painId = getInstanceId(side, region, "pain");
      const familiarPainId = getInstanceId(side, region, "familiarPain");
      const familiarHeadacheId = getInstanceId(side, region, "familiarHeadache");

      const painValue = watch(painId);
      const familiarPainValue = watch(familiarPainId);
      const familiarHeadacheValue = watch(familiarHeadacheId);

      const hasData = painValue !== undefined && painValue !== null;
      const isPainPositive = painValue === ANSWER_VALUES.YES;
      const hasFamiliarPainData = familiarPainValue !== undefined && familiarPainValue !== null;
      const hasFamiliarPain = familiarPainValue === ANSWER_VALUES.YES;
      const hasFamiliarHeadacheData = familiarHeadacheValue !== undefined && familiarHeadacheValue !== null;
      const hasFamiliarHeadache = familiarHeadacheValue === ANSWER_VALUES.YES;

      // Determine if complete
      let isComplete = false;
      if (hasData) {
        if (!isPainPositive) {
          // Pain = no means we're done (early termination)
          isComplete = true;
        } else {
          // Pain = yes, check if all follow-up questions answered
          const questions = getQuestionsForRegion(region);
          const followUpQuestions = questions.filter((q) => q.requiresPain);
          isComplete = followUpQuestions.every((q) => {
            const id = getInstanceId(side, region, q.type);
            const value = watch(id);
            return value !== undefined && value !== null;
          });
        }
      }

      return {
        hasData,
        isPainPositive,
        hasFamiliarPainData,
        hasFamiliarPain,
        hasFamiliarHeadacheData,
        hasFamiliarHeadache,
        isComplete,
      };
    },
    [watch, getInstanceId]
  );

  // Calculate statuses for all regions
  // Note: formValues dependency ensures recalculation when form data changes
  const regionStatuses = useMemo(() => {
    const statuses: Record<RegionId, RegionStatus> = {} as Record<
      RegionId,
      RegionStatus
    >;

    for (const side of Object.values(SIDES)) {
      for (const region of ALL_INTERACTIVE_REGIONS) {
        const regionId = buildRegionId(side, region);
        statuses[regionId] = calculateRegionStatus(side, region);
      }
    }

    return statuses;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculateRegionStatus, formValues]);

  // Calculate progress
  const progress = useMemo((): ExamProgress => {
    const completed = Object.values(regionStatuses).filter(
      (s) => s.isComplete
    ).length;
    return {
      completed,
      total: TOTAL_REGIONS,
      percentage: Math.round((completed / TOTAL_REGIONS) * 100),
    };
  }, [regionStatuses]);

  // Get current question info
  const { currentQuestion, totalQuestionsForCurrentRegion } = useMemo(() => {
    if (step.type !== "QUESTIONING") {
      return { currentQuestion: null, totalQuestionsForCurrentRegion: 0 };
    }

    const { region } = parseRegionId(step.regionId);
    const questions = getQuestionsForRegion(region);
    const question = questions[step.questionIndex];

    return {
      currentQuestion: question?.type ?? null,
      totalQuestionsForCurrentRegion: questions.length,
    };
  }, [step]);

  // Handle region click
  const handleRegionClick = useCallback(
    (side: Side, region: InteractiveRegion) => {
      const regionId = buildRegionId(side, region);

      // Allow switching regions at any time (answers are saved immediately via setValue)
      setStep({ type: "QUESTIONING", regionId, questionIndex: 0 });
    },
    []
  );

  // Handle answer submission
  const handleAnswer = useCallback(
    (answer: boolean) => {
      if (step.type !== "QUESTIONING") return;

      const { side, region } = parseRegionId(step.regionId);
      const questions = getQuestionsForRegion(region);
      const currentQ = questions[step.questionIndex];

      if (!currentQ) return;

      // Save the answer
      const instanceId = getInstanceId(side, region, currentQ.type);
      setValue(instanceId, answer ? ANSWER_VALUES.YES : ANSWER_VALUES.NO);

      // Check for early termination
      if (currentQ.type === "pain" && !answer) {
        // Pain = no, skip all follow-up questions
        setStep({ type: "IDLE" });
        return;
      }

      // Move to next question
      const nextIndex = step.questionIndex + 1;
      if (nextIndex < questions.length) {
        setStep({ type: "QUESTIONING", regionId: step.regionId, questionIndex: nextIndex });
      } else {
        // All questions answered
        setStep({ type: "IDLE" });
      }
    },
    [step, getInstanceId, setValue]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    setStep({ type: "IDLE" });
  }, []);

  return {
    step,
    regionStatuses,
    progress,
    currentQuestion,
    totalQuestionsForCurrentRegion,
    handleRegionClick,
    handleAnswer,
    handleCancel,
  };
}
