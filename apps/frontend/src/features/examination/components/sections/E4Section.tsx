import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useExaminationForm } from "../../form/use-examination-form";
import { validateInterviewCompletion, type IncompleteRegion } from "../../form/validation";
import { getLabel, getSectionCardTitle } from "../../labels";
import { ALL_REGIONS, BASE_REGIONS, type Region, type Side } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import { HeadDiagram } from "../HeadDiagram/head-diagram";
import { type RegionStatus } from "../HeadDiagram/types";
import { QuestionField } from "../QuestionField";
import { RegionDropdown } from "../RegionDropdown";
import { SectionFooter } from "../ui";

interface E4SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

/** Expanded region state per side */
type ExpandedState = { left: Region | null; right: Region | null };

/**
 * Compute RegionStatus for a single region/side from form values.
 */
function computeRegionStatus(
  region: Region,
  side: Side,
  instances: QuestionInstance[],
  getValue: (path: string) => unknown
): RegionStatus {
  const regionInstances = instances.filter(
    (i) => i.context.region === region && i.context.side === side
  );

  const painInst = regionInstances.find((i) => i.context.painType === "pain");
  const familiarPainInst = regionInstances.find((i) => i.context.painType === "familiarPain");
  const familiarHeadacheInst = regionInstances.find(
    (i) => i.context.painType === "familiarHeadache"
  );

  const painValue = painInst ? (getValue(painInst.path) as string | null) : null;
  const familiarPainValue = familiarPainInst
    ? (getValue(familiarPainInst.path) as string | null)
    : null;
  const familiarHeadacheValue = familiarHeadacheInst
    ? (getValue(familiarHeadacheInst.path) as string | null)
    : null;

  const hasData = painValue != null;
  const isPainPositive = painValue === "yes";
  const hasFamiliarPainData = familiarPainValue != null;
  const hasFamiliarPain = familiarPainValue === "yes";
  const hasFamiliarHeadacheData = familiarHeadacheValue != null;
  const hasFamiliarHeadache = familiarHeadacheValue === "yes";

  // Complete if:
  // - pain = no, OR
  // - pain = yes AND familiarPain answered AND (no familiarHeadache question OR familiarHeadache answered)
  let isComplete = false;
  if (hasData) {
    if (!isPainPositive) {
      isComplete = true;
    } else {
      const hasFamiliarHeadacheQuestion = familiarHeadacheInst != null;
      isComplete = hasFamiliarPainData && (!hasFamiliarHeadacheQuestion || hasFamiliarHeadacheData);
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
}

/**
 * InterviewSubsection - HeadDiagram + RegionDropdowns for one subsection (E4B or E4C).
 */
interface InterviewSubsectionProps {
  instances: QuestionInstance[];
  regions: readonly Region[];
  expanded: ExpandedState;
  onExpandChange: (side: Side, region: Region | null) => void;
  incompleteRegions: IncompleteRegion[];
}

function InterviewSubsection({
  instances,
  regions,
  expanded,
  onExpandChange,
  incompleteRegions,
}: InterviewSubsectionProps) {
  const { getValues, watch } = useFormContext();

  // Watch all instance paths to trigger re-renders
  const watchPaths = instances.map((i) => i.path);
  watch(watchPaths);

  // Compute region statuses for the diagram
  const computeStatuses = useCallback(
    (side: Side): Partial<Record<Region, RegionStatus>> => {
      const statuses: Partial<Record<Region, RegionStatus>> = {};
      for (const region of regions) {
        statuses[region] = computeRegionStatus(region, side, instances, getValues);
      }
      return statuses;
    },
    [regions, instances, getValues]
  );

  // Get instances for a specific region/side
  const getRegionInstances = useCallback(
    (region: Region, side: Side) =>
      instances.filter((i) => i.context.region === region && i.context.side === side),
    [instances]
  );

  // Get incomplete region for a specific region/side
  const getIncompleteRegion = useCallback(
    (region: Region, side: Side) =>
      incompleteRegions.find((r) => r.region === region && r.side === side),
    [incompleteRegions]
  );

  // Handle diagram region click - toggle dropdown
  const handleRegionClick = useCallback(
    (side: Side) => (region: Region) => {
      const currentExpanded = expanded[side];
      // Toggle: if same region, close; otherwise open clicked region
      onExpandChange(side, currentExpanded === region ? null : region);
    },
    [expanded, onExpandChange]
  );

  // Handle dropdown expansion change
  const handleDropdownExpand = useCallback(
    (side: Side, region: Region) => (isExpanded: boolean) => {
      onExpandChange(side, isExpanded ? region : null);
    },
    [onExpandChange]
  );

  // Filter incomplete regions by side
  const getIncompleteRegionsForSide = useCallback(
    (side: Side) => incompleteRegions.filter((r) => r.side === side),
    [incompleteRegions]
  );

  // Render a single side panel
  const renderSidePanel = (side: Side) => {
    const sideLabel = side === "right" ? "Rechte Seite" : "Linke Seite";
    const statuses = computeStatuses(side);
    const sideIncompleteRegions = getIncompleteRegionsForSide(side);

    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{sideLabel}</span>

        {/* HeadDiagram */}
        <HeadDiagram
          side={side}
          regions={regions}
          regionStatuses={statuses}
          selectedRegion={expanded[side]}
          onRegionClick={handleRegionClick(side)}
          incompleteRegions={sideIncompleteRegions}
        />

        {/* RegionDropdowns */}
        <div className="w-80 space-y-2">
          {regions.map((region) => (
            <RegionDropdown
              key={region}
              region={region}
              side={side}
              instances={getRegionInstances(region, side)}
              isExpanded={expanded[side] === region}
              onExpandChange={handleDropdownExpand(side, region)}
              incompleteRegion={getIncompleteRegion(region, side)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center items-start gap-8 md:gap-16">
      {renderSidePanel("right")}
      <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />
      {renderSidePanel("left")}
    </div>
  );
}

export function E4Section({ onComplete, onSkip }: E4SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();
  const { getValues, watch } = useFormContext<Record<string, unknown>>();
  const [includeAllRegions, setIncludeAllRegions] = useState(false);

  // Track expanded dropdowns for E4B and E4C
  const [e4bExpanded, setE4bExpanded] = useState<ExpandedState>({ left: null, right: null });
  const [e4cExpanded, setE4cExpanded] = useState<ExpandedState>({ left: null, right: null });

  // Track whether validation has been triggered (only show errors after Next/Skip click)
  const [hasValidated, setHasValidated] = useState(false);

  // Determine which regions to show
  const regions = includeAllRegions ? ALL_REGIONS : BASE_REGIONS;

  // Get instances for each step
  const e4aInstances = getInstancesForStep("e4a");
  const e4bMeasureInstances = getInstancesForStep("e4b-measure");
  const e4bInterviewInstances = getInstancesForStep("e4b-interview");
  const e4cMeasureInstances = getInstancesForStep("e4c-measure");
  const e4cInterviewInstances = getInstancesForStep("e4c-interview");

  // Watch interview fields to trigger re-render when values change
  const e4bWatchPaths = e4bInterviewInstances.map((i) => i.path);
  const e4cWatchPaths = e4cInterviewInstances.map((i) => i.path);
  watch(e4bWatchPaths);
  watch(e4cWatchPaths);

  // Compute incomplete regions inline (light computation, re-runs on watch trigger)
  const interviewContext = { includeAllRegions };
  const e4bIncomplete = validateInterviewCompletion(
    e4bInterviewInstances,
    getValues,
    interviewContext
  ).incompleteRegions;
  const e4cIncomplete = validateInterviewCompletion(
    e4cInterviewInstances,
    getValues,
    interviewContext
  ).incompleteRegions;

  // Handle expanded state changes - only one region selectable at a time across both sides
  const handleE4bExpandChange = useCallback((side: Side, region: Region | null) => {
    const otherSide = side === "left" ? "right" : "left";
    setE4bExpanded({ [side]: region, [otherSide]: null } as ExpandedState);
  }, []);

  const handleE4cExpandChange = useCallback((side: Side, region: Region | null) => {
    const otherSide = side === "left" ? "right" : "left";
    setE4cExpanded({ [side]: region, [otherSide]: null } as ExpandedState);
  }, []);

  // Validation for all E4 steps
  const validateE4 = useCallback(() => {
    setHasValidated(true);

    const interviewContext = { includeAllRegions };

    // Run all step validations (avoid short-circuit to show all errors at once)
    const e4aValid = validateStep("e4a");
    const e4bMeasureValid = validateStep("e4b-measure");
    const e4bInterviewValid = validateStep("e4b-interview", interviewContext);
    const e4cMeasureValid = validateStep("e4c-measure");
    const e4cInterviewValid = validateStep("e4c-interview", interviewContext);

    return e4aValid && e4bMeasureValid && e4bInterviewValid && e4cMeasureValid && e4cInterviewValid;
  }, [validateStep, includeAllRegions]);

  const handleNext = () => {
    if (validateE4()) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getSectionCardTitle(SECTIONS.e4)}</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              id="alle-regionen-header"
              checked={includeAllRegions}
              onCheckedChange={(checked) => setIncludeAllRegions(checked === true)}
            />
            <Label
              htmlFor="alle-regionen-header"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Alle Regionen
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* E4A: Schmerzfreie Mundöffnung */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U4A</Badge>
            <h4 className="font-medium">Schmerzfreie Mundöffnung</h4>
          </div>
          {e4aInstances.map((instance) => (
            <QuestionField
              key={instance.path}
              instance={instance}
              label={getLabel(instance.labelKey)}
            />
          ))}
        </div>

        {/* E4B: Schmerz nach Maximaler nicht-unterstützter Mundöffnung */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U4B</Badge>
            <h4 className="font-medium">Maximale aktive Mundöffnung</h4>
          </div>
          {e4bMeasureInstances.map((instance) => (
            <QuestionField
              key={instance.path}
              instance={instance}
              label={getLabel(instance.labelKey)}
            />
          ))}
          <div className="space-y-3">
            <h5 className="font-medium text-sm">
              Schmerzbefragung nach Maximaler aktiver Mundöffnung
            </h5>
            <InterviewSubsection
              instances={e4bInterviewInstances}
              regions={regions}
              expanded={e4bExpanded}
              onExpandChange={handleE4bExpandChange}
              incompleteRegions={hasValidated ? e4bIncomplete : []}
            />
          </div>
        </div>

        {/* E4C: Maximale passive Mundöffnung */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U4C</Badge>
            <h4 className="font-medium">Maximale passive Mundöffnung</h4>
          </div>
          {e4cMeasureInstances.map((instance) => (
            <QuestionField
              key={instance.path}
              instance={instance}
              label={getLabel(instance.labelKey)}
            />
          ))}
          <div className="space-y-3">
            <h5 className="font-medium text-sm">
              Schmerzbefragung nach Maximaler passiver Mundöffnung
            </h5>
            <InterviewSubsection
              instances={e4cInterviewInstances}
              regions={regions}
              expanded={e4cExpanded}
              onExpandChange={handleE4cExpandChange}
              incompleteRegions={hasValidated ? e4cIncomplete : []}
            />
          </div>
        </div>
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkip={onSkip}
        warnOnSkip
        checkIncomplete={() => !validateE4()}
      />
    </Card>
  );
}
