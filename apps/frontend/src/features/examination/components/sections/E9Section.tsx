import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import type { FieldPath } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { E9_RICH_INSTRUCTIONS } from "../../content/instructions";
import { useExaminationForm, type FormValues } from "../../form/use-examination-form";
import {
  validatePalpationCompletion,
  type IncompletePalpationSite,
} from "../../form/validation";
import { COMMON, getSectionCardTitle } from "../../labels";
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
import { RefusalCheckbox } from "../inputs/RefusalCheckbox";
import { PalpationSiteDropdown } from "../PalpationSiteDropdown";
import type { IncompletePalpationSite as DropdownIncompleteSite } from "../PalpationSiteDropdown/types";
import { MeasurementFlowBlock, SectionFooter } from "../ui";

interface E9SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  isFirstSection?: boolean;
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
  onRefuseChange: (refused: boolean) => void;
}

function PalpationSubsection({
  side,
  instances,
  expanded,
  onExpandChange,
  incompleteSites,
  palpationMode,
  onRefuseChange,
}: PalpationSubsectionProps) {
  const { watch } = useFormContext<FormValues>();
  const sideLabel = side === "right" ? "Rechte Seite" : "Linke Seite";
  const prefix = `e9.${side}`;
  const refusedPath = `${prefix}.refused` as FieldPath<FormValues>;

  // Watch refused state for this side
  const watchedRefused = watch(refusedPath);
  const isRefused = (watchedRefused as unknown as boolean) === true;

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

  if (isRefused) {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">{sideLabel}</span>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground w-80">
          <p className="text-lg font-medium">{COMMON.refusedFull}</p>
          <p className="text-sm text-center">{COMMON.refusedTooltip}</p>
        </div>
        <RefusalCheckbox<FormValues>
          name={refusedPath}
          onRefuseChange={onRefuseChange}
        />
      </div>
    );
  }

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

      {/* Refusal checkbox */}
      <div className="pt-2 border-t w-80">
        <RefusalCheckbox<FormValues>
          name={refusedPath}
          onRefuseChange={onRefuseChange}
        />
      </div>
    </div>
  );
}

/**
 * Collapsible palpation instruction section with all palpation flows.
 */
function PalpationInstructionSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Palpations-Anweisungen
        </span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      <div
        className={cn(
          "mt-4 space-y-6 overflow-hidden transition-all",
          isOpen ? "block" : "hidden"
        )}
      >
        {/* Introduction */}
        <div>
          <h4 className="font-medium mb-3">Einführung</h4>
          <MeasurementFlowBlock instruction={E9_RICH_INSTRUCTIONS.introduction} />
        </div>

        {/* Temporalis */}
        <div>
          <h4 className="font-medium mb-3">M. Temporalis</h4>
          <MeasurementFlowBlock
            instruction={{
              ...E9_RICH_INSTRUCTIONS.temporalisPalpation,
              stepId: "U9-temp",
            }}
          />
        </div>

        {/* Masseter */}
        <div>
          <h4 className="font-medium mb-3">M. Masseter</h4>
          <MeasurementFlowBlock
            instruction={{
              ...E9_RICH_INSTRUCTIONS.masseterPalpation,
              stepId: "U9-mass",
            }}
          />
        </div>

        {/* TMJ Lateral Pole */}
        <div>
          <h4 className="font-medium mb-3">Kiefergelenk - Lateraler Pol</h4>
          <MeasurementFlowBlock instruction={E9_RICH_INSTRUCTIONS.tmjLateralPole} />
        </div>

        {/* TMJ Around Pole */}
        <div>
          <h4 className="font-medium mb-3">Kiefergelenk - Um den lateralen Pol</h4>
          <MeasurementFlowBlock instruction={E9_RICH_INSTRUCTIONS.tmjAroundPole} />
        </div>
      </div>
    </div>
  );
}

export function E9Section({ onComplete, onSkip, onBack, isFirstSection, isLastSection = true }: E9SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();
  const { watch, setValue, getValues, clearErrors } = useFormContext<FormValues>();

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

  // Handle expanded state changes - only one site selectable at a time across both sides
  const handleExpandChange = useCallback((side: Side, site: PalpationSite | null) => {
    const otherSide = side === "left" ? "right" : "left";
    setExpanded({ [side]: site, [otherSide]: null } as ExpandedState);
  }, []);

  // Handle side refusal - clear all palpation data for that side
  const handleSideRefuseChange = useCallback(
    (side: Side) => (refused: boolean) => {
      if (refused) {
        const instances = side === "right" ? rightInstances : leftInstances;
        // Clear all yesNo values for this side
        for (const inst of instances) {
          if (inst.renderType === "yesNo") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue(inst.path as FieldPath<FormValues>, null as any);
            clearErrors(inst.path as FieldPath<FormValues>);
          }
        }
      }
    },
    [rightInstances, leftInstances, setValue, clearErrors]
  );

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
        <div className="flex items-center gap-4">
          <PalpationModeToggle
            value={palpationMode}
            onChange={(mode) => setValue("e9.palpationMode", mode)}
          />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/protocol/$section" params={{ section: "e9" }}>
              <BookOpen className="h-4 w-4 mr-1" />
              Protokoll
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Collapsible instruction section */}
        <PalpationInstructionSection />

        {/* Palpation diagrams and site dropdowns */}
        <div className="flex justify-center items-start gap-8 md:gap-16">
          <PalpationSubsection
            side="right"
            instances={rightInstances}
            expanded={expanded.right}
            onExpandChange={(site) => handleExpandChange("right", site)}
            incompleteSites={hasValidated ? rightIncomplete : []}
            palpationMode={palpationMode}
            onRefuseChange={handleSideRefuseChange("right")}
          />
          <Separator orientation="vertical" className="hidden md:block h-auto self-stretch" />
          <PalpationSubsection
            side="left"
            instances={leftInstances}
            expanded={expanded.left}
            onExpandChange={(site) => handleExpandChange("left", site)}
            incompleteSites={hasValidated ? leftIncomplete : []}
            palpationMode={palpationMode}
            onRefuseChange={handleSideRefuseChange("left")}
          />
        </div>
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkipConfirm={onSkip}
        onBack={onBack}
        isFirstStep={isFirstSection}
        isLastSection={isLastSection}
        warnOnSkip
        checkIncomplete={() => !validateE9()}
      />
    </Card>
  );
}
