import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useExaminationForm } from "../../form/use-examination-form";
import {
  validatePalpationCompletion,
  type IncompletePalpationSite,
} from "../../form/validation";
import { getSectionCardTitle } from "../../labels";
import {
  PALPATION_SITE_KEYS,
  type PalpationMode,
  type PalpationSite,
  type Side,
} from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import { HeadDiagramPalpation } from "../HeadDiagram";
import type { SiteStatus } from "../HeadDiagram/types";
import { PalpationModeToggle } from "../inputs/PalpationModeToggle";
import { PalpationSiteDropdown } from "../PalpationSiteDropdown";
import type { IncompletePalpationSite as DropdownIncompleteSite } from "../PalpationSiteDropdown/types";
import { SectionFooter } from "../ui";

interface E9SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
  /** If true, shows "Abschliessen" instead of "Weiter" */
  isLastSection?: boolean;
}

/** Expanded site state per side */
type ExpandedState = { left: PalpationSite | null; right: PalpationSite | null };

/**
 * Compute SiteStatus for a single palpation site from form values.
 */
function computeSiteStatus(
  site: PalpationSite,
  prefix: string,
  watch: (path: string) => unknown
): SiteStatus {
  const painPath = `${prefix}.${site}.pain`;
  const familiarPainPath = `${prefix}.${site}.familiarPain`;
  const familiarHeadachePath = `${prefix}.${site}.familiarHeadache`;

  const painValue = watch(painPath) as string | null;
  const familiarPainValue = watch(familiarPainPath) as string | null;
  const familiarHeadacheValue = watch(familiarHeadachePath) as string | null;

  const hasData = painValue === "yes" || painValue === "no";
  const isPainPositive = painValue === "yes";
  const hasFamiliarPainData = familiarPainValue === "yes" || familiarPainValue === "no";
  const hasFamiliarPain = familiarPainValue === "yes";
  const hasFamiliarHeadacheData =
    familiarHeadacheValue === "yes" || familiarHeadacheValue === "no";
  const hasFamiliarHeadache = familiarHeadacheValue === "yes";

  // Complete if: no pain, OR pain with all follow-ups answered
  const isComplete =
    hasData &&
    (!isPainPositive ||
      (hasFamiliarPainData && (hasFamiliarHeadacheData || !site.startsWith("temporalis"))));

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
 * PalpationSubsection - HeadDiagramPalpation + PalpationSiteDropdowns for one side.
 */
interface PalpationSubsectionProps {
  side: Side;
  instances: QuestionInstance[];
  expanded: PalpationSite | null;
  onExpandChange: (site: PalpationSite | null) => void;
  incompleteSites: IncompletePalpationSite[];
  palpationMode: PalpationMode;
}

function PalpationSubsection({
  side,
  instances,
  expanded,
  onExpandChange,
  incompleteSites,
  palpationMode,
}: PalpationSubsectionProps) {
  const { watch } = useFormContext();
  const sideLabel = side === "right" ? "Rechte Seite" : "Linke Seite";
  const prefix = `e9.${side}`;

  // Watch all instance paths to trigger re-renders
  const watchPaths = instances.map((i) => i.path);
  watch(watchPaths);

  // Compute site statuses for the diagram
  const computeStatuses = useCallback((): Partial<Record<PalpationSite, SiteStatus>> => {
    const statuses: Partial<Record<PalpationSite, SiteStatus>> = {};
    for (const site of PALPATION_SITE_KEYS) {
      statuses[site] = computeSiteStatus(site, prefix, watch);
    }
    return statuses;
  }, [prefix, watch]);

  const siteStatuses = computeStatuses();

  // Get instances for a specific site
  const getSiteInstances = useCallback(
    (site: PalpationSite) => instances.filter((i) => i.context.site === site),
    [instances]
  );

  // Get incomplete site for a specific site (for dropdown error styling)
  const getIncompleteSite = useCallback(
    (site: PalpationSite): DropdownIncompleteSite | undefined => {
      const incomplete = incompleteSites.find(
        (s) => s.site === site && s.side === side
      );
      if (!incomplete) return undefined;
      return {
        site: incomplete.site as PalpationSite,
        side: incomplete.side,
        missingQuestions: incomplete.missingQuestions,
      };
    },
    [incompleteSites, side]
  );

  // Convert incomplete sites to diagram format
  const diagramIncompleteSites = incompleteSites
    .filter((s) => s.side === side)
    .map((s) => ({ site: s.site as PalpationSite }));

  // Handle diagram site click - toggle dropdown
  const handleSiteClick = useCallback(
    (site: PalpationSite) => {
      // Toggle: if same site, close; otherwise open clicked site
      onExpandChange(expanded === site ? null : site);
    },
    [expanded, onExpandChange]
  );

  // Handle dropdown expansion change
  const handleDropdownExpand = useCallback(
    (site: PalpationSite) => (isExpanded: boolean) => {
      onExpandChange(isExpanded ? site : null);
    },
    [onExpandChange]
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">{sideLabel}</span>

      {/* HeadDiagramPalpation - TMJ sites are only in dropdowns, not diagram */}
      <HeadDiagramPalpation
        side={side}
        siteStatuses={siteStatuses}
        selectedSite={expanded}
        onSiteClick={handleSiteClick}
        incompleteSites={diagramIncompleteSites}
        className="w-[200px] sm:w-[220px]"
      />

      {/* PalpationSiteDropdowns */}
      <div className="w-80 space-y-2">
        {PALPATION_SITE_KEYS.map((site) => (
          <PalpationSiteDropdown
            key={site}
            site={site}
            side={side}
            instances={getSiteInstances(site)}
            isExpanded={expanded === site}
            onExpandChange={handleDropdownExpand(site)}
            incompleteSite={getIncompleteSite(site)}
            palpationMode={palpationMode}
          />
        ))}
      </div>
    </div>
  );
}

export function E9Section({ onComplete, onSkip, isLastSection = true }: E9SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();
  const { watch, setValue, getValues } = useFormContext();

  const rightInstances = getInstancesForStep("e9-right");
  const leftInstances = getInstancesForStep("e9-left");
  const palpationMode = watch("e9.palpationMode") as PalpationMode;

  // Track expanded dropdown for each side
  const [expanded, setExpanded] = useState<ExpandedState>({ left: null, right: null });

  // Track whether validation has been triggered (only show errors after Next/Skip click)
  const [hasValidated, setHasValidated] = useState(false);

  // Watch all instance paths to trigger re-render when values change
  const rightWatchPaths = rightInstances.map((i) => i.path);
  const leftWatchPaths = leftInstances.map((i) => i.path);
  watch(rightWatchPaths);
  watch(leftWatchPaths);

  // Compute incomplete sites inline (light computation, re-runs on watch trigger)
  const palpationContext = { palpationMode };
  const rightIncomplete = validatePalpationCompletion(
    rightInstances,
    getValues,
    palpationContext
  ).incompleteSites;
  const leftIncomplete = validatePalpationCompletion(
    leftInstances,
    getValues,
    palpationContext
  ).incompleteSites;

  // Handle expanded state changes
  const handleExpandChange = useCallback((side: Side, site: PalpationSite | null) => {
    setExpanded((prev) => ({ ...prev, [side]: site }));
  }, []);

  // Extract validation logic to avoid duplication between handleNext and checkIncomplete
  const validateE9 = () => {
    setHasValidated(true);
    const palpationContext = { palpationMode };
    // Run all step validations (avoid short-circuit to show all errors at once)
    const rightValid = validateStep("e9-right", palpationContext);
    const leftValid = validateStep("e9-left", palpationContext);
    return rightValid && leftValid;
  };

  const handleNext = () => {
    if (validateE9()) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{getSectionCardTitle(SECTIONS.e9)}</CardTitle>
        <PalpationModeToggle
          value={palpationMode}
          onChange={(mode) => setValue("e9.palpationMode", mode)}
        />
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-start gap-8 md:gap-16">
          <PalpationSubsection
            side="right"
            instances={rightInstances}
            expanded={expanded.right}
            onExpandChange={(site) => handleExpandChange("right", site)}
            incompleteSites={hasValidated ? rightIncomplete : []}
            palpationMode={palpationMode}
          />
          <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />
          <PalpationSubsection
            side="left"
            instances={leftInstances}
            expanded={expanded.left}
            onExpandChange={(site) => handleExpandChange("left", site)}
            incompleteSites={hasValidated ? leftIncomplete : []}
            palpationMode={palpationMode}
          />
        </div>
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkip={onSkip}
        isLastSection={isLastSection}
        warnOnSkip
        checkIncomplete={() => !validateE9()}
      />
    </Card>
  );
}
