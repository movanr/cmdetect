/**
 * E1: Pain & Headache Location Section
 *
 * Displays bilateral checkbox groups for:
 * - E1a: Pain location in the last 30 days
 * - E1b: Headache location in the last 30 days
 *
 * Each subsection includes interactive HeadDiagram components that are
 * bidirectionally linked to the checkbox groups.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SECTIONS, SVG_REGIONS, type Region, type Side } from "@cmdetect/dc-tmd";
import { useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { HeadDiagram } from "../HeadDiagram/head-diagram";
import type { RegionStatus } from "../HeadDiagram/types";
import { QuestionField } from "../QuestionField";
import { SectionFooter } from "../ui";

/**
 * Regions supported by HeadDiagram for E1 pain location.
 * otherMast is not in SVG, so it remains checkbox-only.
 */
const E1_PAIN_SVG_REGIONS: readonly Region[] = SVG_REGIONS;

/**
 * For headache location, only temporalis is visualizable.
 */
const E1_HEADACHE_SVG_REGIONS: readonly Region[] = ["temporalis"];

interface E1SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

/**
 * Compute RegionStatus for E1 based on checkbox values.
 * For E1, there are no familiar pain questions - just selection status.
 */
function computeE1RegionStatus(region: Region, values: string[] | undefined): RegionStatus {
  const isSelected = values?.includes(region) ?? false;
  return {
    hasData: true,
    isPainPositive: isSelected,
    hasFamiliarPainData: true,
    hasFamiliarPain: isSelected, // Use positive state for selected visual
    hasFamiliarHeadacheData: true,
    hasFamiliarHeadache: false,
    isComplete: true,
  };
}

export function E1Section({ onComplete, onSkip }: E1SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();
  const { watch, getValues, setValue } = useFormContext();

  const allInstances = getInstancesForStep("e1-all");

  // Split instances by type and side
  const painRight = allInstances.find((i) => i.path === "e1.painLocation.right");
  const painLeft = allInstances.find((i) => i.path === "e1.painLocation.left");
  const headacheRight = allInstances.find((i) => i.path === "e1.headacheLocation.right");
  const headacheLeft = allInstances.find((i) => i.path === "e1.headacheLocation.left");

  // Watch pain and headache location values for reactive updates
  const painRightValues = watch("e1.painLocation.right") as string[] | undefined;
  const painLeftValues = watch("e1.painLocation.left") as string[] | undefined;
  const headacheRightValues = watch("e1.headacheLocation.right") as string[] | undefined;
  const headacheLeftValues = watch("e1.headacheLocation.left") as string[] | undefined;

  // Compute region statuses for pain location diagrams
  const painRightStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of E1_PAIN_SVG_REGIONS) {
      statuses[region] = computeE1RegionStatus(region, painRightValues);
    }
    return statuses;
  }, [painRightValues]);

  const painLeftStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of E1_PAIN_SVG_REGIONS) {
      statuses[region] = computeE1RegionStatus(region, painLeftValues);
    }
    return statuses;
  }, [painLeftValues]);

  // Compute region statuses for headache location diagrams
  const headacheRightStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of E1_HEADACHE_SVG_REGIONS) {
      statuses[region] = computeE1RegionStatus(region, headacheRightValues);
    }
    return statuses;
  }, [headacheRightValues]);

  const headacheLeftStatuses = useMemo(() => {
    const statuses: Partial<Record<Region, RegionStatus>> = {};
    for (const region of E1_HEADACHE_SVG_REGIONS) {
      statuses[region] = computeE1RegionStatus(region, headacheLeftValues);
    }
    return statuses;
  }, [headacheLeftValues]);

  /**
   * Handle diagram region click for pain location - toggle region in checkbox array.
   */
  const handlePainRegionClick = useCallback(
    (region: Region, side: Side) => {
      const fieldPath = `e1.painLocation.${side}` as const;
      const currentValues = (getValues(fieldPath) as string[]) ?? [];

      if (currentValues.includes(region)) {
        // Uncheck: remove from array
        setValue(
          fieldPath,
          currentValues.filter((v) => v !== region),
          { shouldValidate: true }
        );
      } else {
        // Check: add to array, remove "none" if present
        const newValues = currentValues.filter((v) => v !== "none");
        setValue(fieldPath, [...newValues, region], { shouldValidate: true });
      }
    },
    [getValues, setValue]
  );

  /**
   * Handle diagram region click for headache location - toggle region in checkbox array.
   */
  const handleHeadacheRegionClick = useCallback(
    (region: Region, side: Side) => {
      const fieldPath = `e1.headacheLocation.${side}` as const;
      const currentValues = (getValues(fieldPath) as string[]) ?? [];

      if (currentValues.includes(region)) {
        // Uncheck: remove from array
        setValue(
          fieldPath,
          currentValues.filter((v) => v !== region),
          { shouldValidate: true }
        );
      } else {
        // Check: add to array, remove "none" if present
        const newValues = currentValues.filter((v) => v !== "none");
        setValue(fieldPath, [...newValues, region], { shouldValidate: true });
      }
    },
    [getValues, setValue]
  );

  const handleNext = () => {
    const isValid = validateStep("e1-all");
    if (isValid) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{getSectionCardTitle(SECTIONS.e1)}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/protocol/$section" params={{ section: "e1" }}>
            <BookOpen className="h-4 w-4 mr-1" />
            Protokoll
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* E1A: Pain Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U1A</Badge>
            <h4 className="font-medium">Schmerzlokalisation (letzte 30 Tage)</h4>
          </div>

          {/* Unified diagram + checkboxes layout */}
          <div className="flex justify-center items-start gap-8 md:gap-16">
            {/* Right side panel */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Rechte Seite</span>
              <HeadDiagram
                side="right"
                regions={E1_PAIN_SVG_REGIONS}
                regionStatuses={painRightStatuses}
                onRegionClick={(region) => handlePainRegionClick(region, "right")}
              />
              <div className="w-44">{painRight && <QuestionField instance={painRight} />}</div>
            </div>

            {/* Vertical separator */}
            <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />

            {/* Left side panel */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Linke Seite</span>
              <HeadDiagram
                side="left"
                regions={E1_PAIN_SVG_REGIONS}
                regionStatuses={painLeftStatuses}
                onRegionClick={(region) => handlePainRegionClick(region, "left")}
              />
              <div className="w-44">{painLeft && <QuestionField instance={painLeft} />}</div>
            </div>
          </div>
        </div>

        {/* E1B: Headache Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U1B</Badge>
            <h4 className="font-medium">Kopfschmerzlokalisation (letzte 30 Tage)</h4>
          </div>

          {/* Unified diagram + checkboxes layout */}
          <div className="flex justify-center items-start gap-8 md:gap-16">
            {/* Right side panel */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Rechts</span>
              <HeadDiagram
                side="right"
                regions={E1_HEADACHE_SVG_REGIONS}
                regionStatuses={headacheRightStatuses}
                onRegionClick={(region) => handleHeadacheRegionClick(region, "right")}
              />
              <div className="w-44">
                {headacheRight && <QuestionField instance={headacheRight} />}
              </div>
            </div>

            {/* Vertical separator */}
            <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />

            {/* Left side panel */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Links</span>
              <HeadDiagram
                side="left"
                regions={E1_HEADACHE_SVG_REGIONS}
                regionStatuses={headacheLeftStatuses}
                onRegionClick={(region) => handleHeadacheRegionClick(region, "left")}
              />
              <div className="w-44">
                {headacheLeft && <QuestionField instance={headacheLeft} />}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkip={onSkip}
        warnOnSkip
        checkIncomplete={() => !validateStep("e1-all")}
      />
    </Card>
  );
}
