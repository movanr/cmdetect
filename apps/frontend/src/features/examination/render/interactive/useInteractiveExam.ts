/**
 * useInteractiveExam - State management for interactive E4 examination.
 *
 * Consumes question definitions as source of truth and provides generic
 * answer handlers. Questions are filtered by region at runtime.
 */

import { useState, useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { Movement } from "../../model/movement";
import { PAIN_TYPES } from "../../model/pain";
import { ANSWER_VALUES, type AnswerValue } from "../../model/answer";
import type { Question } from "../../model/question";
import { evaluateEnableWhen, type FormValues } from "../../form/evaluateEnableWhen";
import { SIDES, type Side } from "../../model/side";
import {
  type RegionId,
  type InteractiveRegion,
  type RegionStatus,
  type ExamProgress,
  ALL_INTERACTIVE_REGIONS,
  TOTAL_REGIONS,
  parseRegionId,
  buildRegionId,
  mapInteractiveToRegion,
} from "./types";

interface UseInteractiveExamProps {
  movement: Movement;
  /** Questions for this movement (from painInterviewAfterMovement for all sides/regions) */
  questions: Question[];
  /** Form values from watch() - passed from component to ensure reactivity */
  formValues: FormValues;
}

interface UseInteractiveExamReturn {
  selectedRegion: RegionId | null;
  regionStatuses: Record<RegionId, RegionStatus>;
  progress: ExamProgress;
  /** Get questions for a specific region (filtered from input questions) */
  getQuestionsForRegion: (regionId: RegionId) => Question[];
  /** Check if a question is enabled based on enableWhen */
  isQuestionEnabled: (question: Question) => boolean;
  /** Generic answer setter */
  setAnswer: (question: Question, value: AnswerValue | undefined) => void;
  /** Toggle answer (set if different, clear if same) */
  toggleAnswer: (question: Question, value: AnswerValue) => void;
  handleRegionClick: (side: Side, region: InteractiveRegion) => void;
  handleDeselect: () => void;
  completeAllRegions: () => void;
}

export function useInteractiveExam({
  movement: _movement,
  questions,
  formValues: _formValues, // Used to trigger re-renders via watch(), but we use getValues() for reading
}: UseInteractiveExamProps): UseInteractiveExamReturn {
  // Note: movement is available via questions[*].context.movement
  // Kept in props for API consistency and future use
  const { setValue, getValues } = useFormContext();
  const [selectedRegion, setSelectedRegionInternal] = useState<RegionId | null>(null);

  const setSelectedRegion = useCallback((value: RegionId | null) => {
    setSelectedRegionInternal(value);
  }, []);

  // formValues is now passed from component to ensure proper reactivity

  // Filter questions for a specific region
  const getQuestionsForRegion = useCallback(
    (regionId: RegionId): Question[] => {
      const { side, region } = parseRegionId(regionId);
      const regionConstant = mapInteractiveToRegion(region);
      return questions.filter(
        (q) => q.context.side === side && q.context.region === regionConstant
      );
    },
    [questions]
  );

  // Check if question is enabled via enableWhen
  const isQuestionEnabled = useCallback(
    (question: Question): boolean => {
      // Pass getValues as the form value getter (handles RHF's nested structure)
      return evaluateEnableWhen(question, getValues, questions);
    },
    [getValues, questions]
  );

  // Generic answer setter with cascading clear for dependent questions
  const setAnswer = useCallback(
    (question: Question, value: AnswerValue | undefined) => {
      setValue(question.instanceId, value);

      // If setting pain to "no" or clearing, also clear dependent questions
      if (
        question.semanticId === PAIN_TYPES.PAIN &&
        value !== ANSWER_VALUES.YES
      ) {
        const dependentQuestions = questions.filter(
          (q) =>
            q.enableWhen?.dependsOn.semanticId === PAIN_TYPES.PAIN &&
            q.context.side === question.context.side &&
            q.context.region === question.context.region &&
            q.context.movement === question.context.movement
        );
        for (const depQ of dependentQuestions) {
          setValue(depQ.instanceId, undefined);
        }
      }
    },
    [setValue, questions]
  );

  // Toggle answer (set if different, clear if same)
  const toggleAnswer = useCallback(
    (question: Question, value: AnswerValue) => {
      // Use getValues() because formValues from watch() is nested by dot notation
      const currentValue = getValues(question.instanceId);
      if (currentValue === value) {
        setAnswer(question, undefined);
      } else {
        setAnswer(question, value);
      }
    },
    [getValues, setAnswer]
  );

  // Calculate status for a single region from its questions
  // Note: Using getValues() because formValues from watch() is nested by dot notation
  const calculateRegionStatus = (regionId: RegionId): RegionStatus => {
    const regionQuestions = getQuestionsForRegion(regionId);

    const painQ = regionQuestions.find(
      (q) => q.semanticId === PAIN_TYPES.PAIN
    );
    const familiarQ = regionQuestions.find(
      (q) => q.semanticId === PAIN_TYPES.FAMILIAR
    );
    const headacheQ = regionQuestions.find(
      (q) => q.semanticId === PAIN_TYPES.FAMILIAR_HEADACHE
    );

    // Use getValues() with instanceId path - RHF handles nested structure resolution
    const painValue = painQ ? getValues(painQ.instanceId) : undefined;
    const familiarValue = familiarQ
      ? getValues(familiarQ.instanceId)
      : undefined;
    const headacheValue = headacheQ
      ? getValues(headacheQ.instanceId)
      : undefined;

    const hasData = painValue !== undefined && painValue !== null;
    const isPainPositive = painValue === ANSWER_VALUES.YES;
    const hasFamiliarPainData =
      familiarValue !== undefined && familiarValue !== null;
    const hasFamiliarPain = familiarValue === ANSWER_VALUES.YES;
    const hasFamiliarHeadacheData =
      headacheValue !== undefined && headacheValue !== null;
    const hasFamiliarHeadache = headacheValue === ANSWER_VALUES.YES;

    // Region is complete if pain has been answered
    const isComplete = hasData;

    return {
      hasData,
      isPainPositive,
      hasFamiliarPainData,
      hasFamiliarPain,
      hasFamiliarHeadacheData,
      hasFamiliarHeadache,
      isComplete,
    };
  };

  // Calculate statuses for all regions
  // Note: Not memoized because watch() returns a proxy with stable reference
  // even when values change, which breaks useMemo dependency detection
  const regionStatuses = (() => {
    const statuses: Record<RegionId, RegionStatus> = {} as Record<
      RegionId,
      RegionStatus
    >;

    for (const side of Object.values(SIDES)) {
      for (const region of ALL_INTERACTIVE_REGIONS) {
        const regionId = buildRegionId(side, region);
        statuses[regionId] = calculateRegionStatus(regionId);
      }
    }

    return statuses;
  })();

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

  // Handle region click - just select/deselect, don't modify values
  const handleRegionClick = useCallback(
    (side: Side, region: InteractiveRegion) => {
      const regionId = buildRegionId(side, region);

      if (selectedRegion === regionId) {
        // Already selected - just deselect
        setSelectedRegion(null);
      } else {
        // Select this region
        setSelectedRegion(regionId);
      }
    },
    [selectedRegion, setSelectedRegion]
  );

  // Deselect current region and set pain=no
  const handleDeselect = useCallback(() => {
    if (!selectedRegion) return;

    const regionQuestions = getQuestionsForRegion(selectedRegion);
    const painQ = regionQuestions.find(
      (q) => q.semanticId === PAIN_TYPES.PAIN
    );

    if (painQ) {
      setAnswer(painQ, ANSWER_VALUES.NO);
    }

    setSelectedRegion(null);
  }, [selectedRegion, getQuestionsForRegion, setAnswer, setSelectedRegion]);

  // Complete all unanswered regions with pain=no
  const completeAllRegions = useCallback(() => {
    for (const side of Object.values(SIDES)) {
      for (const region of ALL_INTERACTIVE_REGIONS) {
        const regionId = buildRegionId(side, region);
        const regionQuestions = getQuestionsForRegion(regionId);
        const painQ = regionQuestions.find(
          (q) => q.semanticId === PAIN_TYPES.PAIN
        );

        if (painQ) {
          // Use getValues() because formValues from watch() is nested by dot notation
          const currentValue = getValues(painQ.instanceId);
          // Only set pain=no for unanswered regions
          if (currentValue === undefined || currentValue === null) {
            setValue(painQ.instanceId, ANSWER_VALUES.NO);
          }
        }
      }
    }
    // Deselect current region
    setSelectedRegion(null);
  }, [getQuestionsForRegion, getValues, setValue, setSelectedRegion]);

  return {
    selectedRegion,
    regionStatuses,
    progress,
    getQuestionsForRegion,
    isQuestionEnabled,
    setAnswer,
    toggleAnswer,
    handleRegionClick,
    handleDeselect,
    completeAllRegions,
  };
}
