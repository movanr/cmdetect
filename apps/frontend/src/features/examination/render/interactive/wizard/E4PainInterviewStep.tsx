/**
 * E4PainInterviewStep - Step content for pain interview steps.
 *
 * Wraps InteractiveExamSection with wizard navigation.
 * "Keine weiteren Schmerzregionen" button advances to next step.
 */

import { useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, CheckCircle2, SkipForward } from "lucide-react";
import { SIDES, type Side } from "../../../model/side";
import type { Question } from "../../../model/question";
import { painInterviewAfterMovement } from "../../../definition/questions/pain";
import { E4_INSTRUCTIONS } from "../../../content/instructions";
import {
  type Region,
  type RegionStatus,
  EMPTY_REGION_STATUS,
  parseRegionId,
  buildRegionId,
} from "../types";
import { useInteractiveExam } from "../useInteractiveExam";
import { HeadDiagram } from "../HeadDiagram";
import { RegionStatusList } from "../RegionStatusList";
import { InlinePainBadges } from "../InlinePainBadges";
import type { E4Step } from "./types";

interface E4PainInterviewStepProps {
  /** Step definition */
  step: E4Step;
  /** Regions to assess */
  regions: readonly Region[];
  /** Callback when advancing to next step */
  onNext: () => void;
  /** Callback when skipping this step */
  onSkip: () => void;
  /** Optional className */
  className?: string;
}

export function E4PainInterviewStep({
  step,
  regions,
  onNext,
  onSkip,
  className,
}: E4PainInterviewStepProps) {
  const { watch } = useFormContext();
  const movement = step.movement!;

  // Get form values for reactivity
  const formValues = watch();

  // Generate questions for this movement
  const questions = useMemo((): Question[] => {
    const all: Question[] = [];
    for (const side of Object.values(SIDES) as Side[]) {
      for (const region of regions) {
        all.push(...painInterviewAfterMovement({ movement, side, region }));
      }
    }
    return all;
  }, [movement, regions]);

  const {
    selectedRegion,
    regionStatuses,
    handleRegionClick,
    getQuestionsForRegion,
    isQuestionEnabled,
    toggleAnswer,
    completeAllRegions,
  } = useInteractiveExam({ movement, regions, questions, formValues });

  // Get statuses for a specific side
  const getStatusesForSide = useCallback(
    (side: Side): Record<Region, RegionStatus> => {
      const result: Record<Region, RegionStatus> = {} as Record<
        Region,
        RegionStatus
      >;
      for (const region of regions) {
        const regionId = buildRegionId(side, region);
        result[region] = regionStatuses[regionId] ?? EMPTY_REGION_STATUS;
      }
      return result;
    },
    [regionStatuses, regions]
  );

  // Get selected region for a specific side
  const getSelectedForSide = useCallback(
    (side: Side): Region | null => {
      if (!selectedRegion) return null;
      const { side: selectedSide, region } = parseRegionId(selectedRegion);
      return selectedSide === side ? region : null;
    },
    [selectedRegion]
  );

  // Get questions for selected region
  const selectedRegionQuestions = selectedRegion
    ? getQuestionsForRegion(selectedRegion)
    : [];

  // Handle completion - complete all regions and advance
  const handleComplete = useCallback(() => {
    completeAllRegions();
    onNext();
  }, [completeAllRegions, onNext]);

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/30 bg-card p-4 space-y-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Badge variant="default">{step.badge}</Badge>
        <h3 className="font-semibold">{step.title}</h3>
      </div>

      {/* Pain localization diagram */}
      <Card>
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <CardTitle className="text-base">Schmerzlokalisation</CardTitle>
            {/* Pain interview guidance */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <span className="italic">
                  "{E4_INSTRUCTIONS.painInterview.prompt}"
                </span>
                <span className="mx-2">-</span>
                <span>{E4_INSTRUCTIONS.painInterview.guidance}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-8">
            {/* Patient's RIGHT side (displayed on left) */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Rechts (Patient)
              </span>
              <div className="flex items-start gap-2">
                <RegionStatusList
                  regions={regions}
                  regionStatuses={getStatusesForSide(SIDES.RIGHT)}
                  selectedRegion={getSelectedForSide(SIDES.RIGHT)}
                  onRegionClick={(region) =>
                    handleRegionClick(SIDES.RIGHT, region)
                  }
                />
                <HeadDiagram
                  side={SIDES.RIGHT}
                  regions={regions}
                  regionStatuses={getStatusesForSide(SIDES.RIGHT)}
                  selectedRegion={getSelectedForSide(SIDES.RIGHT)}
                  onRegionClick={(region) =>
                    handleRegionClick(SIDES.RIGHT, region)
                  }
                />
              </div>
            </div>

            <Separator orientation="vertical" className="h-auto self-stretch" />

            {/* Patient's LEFT side (displayed on right) */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Links (Patient)
              </span>
              <div className="flex items-start gap-2">
                <HeadDiagram
                  side={SIDES.LEFT}
                  regions={regions}
                  regionStatuses={getStatusesForSide(SIDES.LEFT)}
                  selectedRegion={getSelectedForSide(SIDES.LEFT)}
                  onRegionClick={(region) =>
                    handleRegionClick(SIDES.LEFT, region)
                  }
                />
                <RegionStatusList
                  regions={regions}
                  regionStatuses={getStatusesForSide(SIDES.LEFT)}
                  selectedRegion={getSelectedForSide(SIDES.LEFT)}
                  onRegionClick={(region) =>
                    handleRegionClick(SIDES.LEFT, region)
                  }
                />
              </div>
            </div>
          </div>

          {/* Inline pain badges - shown when a region is selected */}
          {selectedRegion && selectedRegionQuestions.length > 0 && (
            <InlinePainBadges
              selectedRegion={selectedRegion}
              questions={selectedRegionQuestions}
              isQuestionEnabled={isQuestionEnabled}
              onToggleAnswer={toggleAnswer}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground"
        >
          <SkipForward className="h-4 w-4 mr-1" />
          Überspringen
        </Button>
        <Button type="button" onClick={handleComplete}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Keine weiteren Schmerzregionen
        </Button>
      </div>
    </div>
  );
}
