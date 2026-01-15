/**
 * useInteractiveExam - Simplified state management for interactive E4 examination.
 *
 * New flow:
 * - Click region → auto-sets pain=yes, region becomes selected
 * - Inline badges toggle familiar pain / familiar headache
 * - Click same region again → deselects (sets pain=no, clears follow-ups)
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
  type RegionId,
  type InteractiveRegion,
  type RegionStatus,
  type ExamProgress,
  INTERACTIVE_REGIONS,
  ALL_INTERACTIVE_REGIONS,
  TOTAL_REGIONS,
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

interface UseInteractiveExamProps {
  movement: Movement;
}

interface UseInteractiveExamReturn {
  selectedRegion: RegionId | null;
  regionStatuses: Record<RegionId, RegionStatus>;
  progress: ExamProgress;
  handleRegionClick: (side: Side, region: InteractiveRegion) => void;
  setPain: () => void;
  setNoPain: () => void;
  setFamiliarPain: () => void;
  setNoFamiliarPain: () => void;
  setFamiliarHeadache: () => void;
  setNoFamiliarHeadache: () => void;
  handleDeselect: () => void;
  completeAllRegions: () => void;
}

export function useInteractiveExam({
  movement,
}: UseInteractiveExamProps): UseInteractiveExamReturn {
  const { watch, setValue } = useFormContext();
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);

  // Subscribe to all form changes to trigger re-renders when values change
  const formValues = watch();

  // Build instance ID for a specific pain type
  const getInstanceId = useCallback(
    (side: Side, region: InteractiveRegion, painType: string) => {
      const regionConstant = mapToRegionConstant(region);
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
      const painId = getInstanceId(side, region, PAIN_TYPES.PAIN);
      const familiarPainId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR);
      const familiarHeadacheId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR_HEADACHE);

      const painValue = watch(painId);
      const familiarPainValue = watch(familiarPainId);
      const familiarHeadacheValue = watch(familiarHeadacheId);

      const hasData = painValue !== undefined && painValue !== null;
      const isPainPositive = painValue === ANSWER_VALUES.YES;
      const hasFamiliarPainData = familiarPainValue !== undefined && familiarPainValue !== null;
      const hasFamiliarPain = familiarPainValue === ANSWER_VALUES.YES;
      const hasFamiliarHeadacheData = familiarHeadacheValue !== undefined && familiarHeadacheValue !== null;
      const hasFamiliarHeadache = familiarHeadacheValue === ANSWER_VALUES.YES;

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
    },
    [watch, getInstanceId]
  );

  // Calculate statuses for all regions
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
    [selectedRegion]
  );

  // Toggle pain=yes (clears if already yes)
  const setPain = useCallback(() => {
    if (!selectedRegion) return;

    const { side, region } = parseRegionId(selectedRegion);
    const painId = getInstanceId(side, region, PAIN_TYPES.PAIN);
    const currentValue = watch(painId);

    if (currentValue === ANSWER_VALUES.YES) {
      // Already yes, clear it
      setValue(painId, undefined);
    } else {
      setValue(painId, ANSWER_VALUES.YES);
    }
  }, [selectedRegion, getInstanceId, setValue, watch]);

  // Toggle pain=no and clear follow-ups (clears if already no)
  const setNoPain = useCallback(() => {
    if (!selectedRegion) return;

    const { side, region } = parseRegionId(selectedRegion);
    const painId = getInstanceId(side, region, PAIN_TYPES.PAIN);
    const familiarPainId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR);
    const familiarHeadacheId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR_HEADACHE);
    const currentValue = watch(painId);

    if (currentValue === ANSWER_VALUES.NO) {
      // Already no, clear it
      setValue(painId, undefined);
    } else {
      setValue(painId, ANSWER_VALUES.NO);
      setValue(familiarPainId, undefined);
      setValue(familiarHeadacheId, undefined);
    }
  }, [selectedRegion, getInstanceId, setValue, watch]);

  // Toggle familiar pain=yes (clears if already yes)
  const setFamiliarPain = useCallback(() => {
    if (!selectedRegion) return;

    const { side, region } = parseRegionId(selectedRegion);
    const familiarPainId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR);
    const currentValue = watch(familiarPainId);

    if (currentValue === ANSWER_VALUES.YES) {
      setValue(familiarPainId, undefined);
    } else {
      setValue(familiarPainId, ANSWER_VALUES.YES);
    }
  }, [selectedRegion, getInstanceId, setValue, watch]);

  // Toggle familiar pain=no (clears if already no)
  const setNoFamiliarPain = useCallback(() => {
    if (!selectedRegion) return;

    const { side, region } = parseRegionId(selectedRegion);
    const familiarPainId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR);
    const currentValue = watch(familiarPainId);

    if (currentValue === ANSWER_VALUES.NO) {
      // Already no, clear it
      setValue(familiarPainId, undefined);
    } else {
      setValue(familiarPainId, ANSWER_VALUES.NO);
    }
  }, [selectedRegion, getInstanceId, setValue, watch]);

  // Toggle familiar headache=yes (clears if already yes)
  const setFamiliarHeadache = useCallback(() => {
    if (!selectedRegion) return;

    const { side, region } = parseRegionId(selectedRegion);
    if (region !== INTERACTIVE_REGIONS.TEMPORALIS) return;

    const familiarHeadacheId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR_HEADACHE);
    const currentValue = watch(familiarHeadacheId);

    if (currentValue === ANSWER_VALUES.YES) {
      setValue(familiarHeadacheId, undefined);
    } else {
      setValue(familiarHeadacheId, ANSWER_VALUES.YES);
    }
  }, [selectedRegion, getInstanceId, setValue, watch]);

  // Toggle familiar headache=no (clears if already no)
  const setNoFamiliarHeadache = useCallback(() => {
    if (!selectedRegion) return;

    const { side, region } = parseRegionId(selectedRegion);
    if (region !== INTERACTIVE_REGIONS.TEMPORALIS) return;

    const familiarHeadacheId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR_HEADACHE);
    const currentValue = watch(familiarHeadacheId);

    if (currentValue === ANSWER_VALUES.NO) {
      // Already no, clear it
      setValue(familiarHeadacheId, undefined);
    } else {
      setValue(familiarHeadacheId, ANSWER_VALUES.NO);
    }
  }, [selectedRegion, getInstanceId, setValue, watch]);

  // Deselect current region (sets pain=no)
  const handleDeselect = useCallback(() => {
    if (!selectedRegion) return;

    const { side, region } = parseRegionId(selectedRegion);
    const painId = getInstanceId(side, region, PAIN_TYPES.PAIN);

    setValue(painId, ANSWER_VALUES.NO);
    // Clear follow-up values
    const familiarPainId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR);
    const familiarHeadacheId = getInstanceId(side, region, PAIN_TYPES.FAMILIAR_HEADACHE);
    setValue(familiarPainId, undefined);
    setValue(familiarHeadacheId, undefined);
    setSelectedRegion(null);
  }, [selectedRegion, getInstanceId, setValue]);

  // Complete all unanswered regions with pain=no
  const completeAllRegions = useCallback(() => {
    for (const side of Object.values(SIDES)) {
      for (const region of ALL_INTERACTIVE_REGIONS) {
        const painId = getInstanceId(side, region, PAIN_TYPES.PAIN);
        const currentValue = watch(painId);

        // Only set pain=no for unanswered regions
        if (currentValue === undefined || currentValue === null) {
          setValue(painId, ANSWER_VALUES.NO);
        }
      }
    }
    // Deselect current region
    setSelectedRegion(null);
  }, [getInstanceId, watch, setValue]);

  return {
    selectedRegion,
    regionStatuses,
    progress,
    handleRegionClick,
    setPain,
    setNoPain,
    setFamiliarPain,
    setNoFamiliarPain,
    setFamiliarHeadache,
    setNoFamiliarHeadache,
    handleDeselect,
    completeAllRegions,
  };
}
