import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PALPATION_MODE_QUESTIONS, SECTIONS, SITE_CONFIG } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle, ChevronLeft } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { E9RichInstructions } from "../../content/instructions";
import { createE9RichInstructions, isPainInterviewInstruction } from "../../content/instructions";
import type { RichMeasurementInstruction } from "../../content/types";
import { clearInstanceErrors, setInstanceValue } from "../../form/form-helpers";
import { useExaminationForm, type FormValues } from "../../form/use-examination-form";
import { validatePalpationCompletion, type IncompletePalpationSite } from "../../form/validation";
import { useScrollToActiveStep } from "../../hooks/use-scroll-to-active-step";
import { COMMON, getPainTypeLabel, getSectionCardTitle } from "../../labels";
import {
  type PainType,
  type PalpationMode,
  type PalpationPainQuestion,
  type PalpationSite,
  type Side,
} from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import { HeadDiagramPalpation } from "../HeadDiagram";
import type { SiteStatus } from "../HeadDiagram/types";
import { PalpationModeToggle } from "../inputs/PalpationModeToggle";
import { YesNoField } from "../inputs/YesNoField";
import { PalpationSiteDropdown } from "../PalpationSiteDropdown";
import type { IncompletePalpationSite as DropdownIncompleteSite } from "../PalpationSiteDropdown/types";
import {
  IntroPanel,
  MeasurementFlowBlock,
  PainInterviewBlock,
  SectionFooter,
  StepBar,
  type StepStatus,
} from "../ui";
import { SectionCommentButton } from "../ui/SectionCommentButton";
import type { SectionProps } from "./types";

// =============================================================================
// Step Configuration
// =============================================================================

type E9StepId = "e9-temporalis" | "e9-masseter" | "e9-tmj-lateral" | "e9-tmj-around";

const E9_STEP_ORDER: E9StepId[] = [
  "e9-temporalis",
  "e9-masseter",
  "e9-tmj-lateral",
  "e9-tmj-around",
];

const E9_STEP_CONFIG: Record<E9StepId, { badge: string; title: string }> = {
  "e9-temporalis": { badge: "U9", title: "Temporalis-Palpation" },
  "e9-masseter": { badge: "U9", title: "Masseter-Palpation" },
  "e9-tmj-lateral": { badge: "U9", title: "Lateraler Pol" },
  "e9-tmj-around": { badge: "U9", title: "Um den lateralen Pol" },
};

/** Sites shown on each step */
const E9_STEP_SITES: Record<E9StepId, readonly PalpationSite[]> = {
  "e9-temporalis": ["temporalisPosterior", "temporalisMiddle", "temporalisAnterior"],
  "e9-masseter": ["masseterOrigin", "masseterBody", "masseterInsertion"],
  "e9-tmj-lateral": ["tmjLateralPole"],
  "e9-tmj-around": ["tmjAroundLateralPole"],
};

/** Pain type display order (matches PalpationSiteDropdown) */
const PAIN_TYPE_ORDER: readonly PalpationPainQuestion[] = [
  "pain",
  "familiarPain",
  "familiarHeadache",
  "spreadingPain",
  "referredPain",
];

// =============================================================================
// Props
// =============================================================================

interface E9SectionProps extends SectionProps {
  step?: number; // 1-indexed from URL, undefined = auto-detect
  onStepChange?: (stepIndex: number | null) => void; // 0-indexed, null = summary
  isLastSection?: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

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
  const hasFamiliarHeadacheData = familiarHeadacheValue === "yes" || familiarHeadacheValue === "no";
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
 * Compute step completion status for a palpation sub-step.
 * Returns "completed" if all sites are answered, "skipped" if explicitly skipped, null otherwise.
 */
function computeE9StepStatus(
  stepId: E9StepId,
  palpationMode: PalpationMode,
  rightInstances: QuestionInstance[],
  leftInstances: QuestionInstance[],
  getValues: (path: string) => unknown
): "completed" | "skipped" | null {
  const sites = E9_STEP_SITES[stepId];
  if (sites.length === 0) return null;

  // Filter instances to current step's sites
  const filteredRight = rightInstances.filter(
    (i) => i.context.site && sites.includes(i.context.site as PalpationSite)
  );
  const filteredLeft = leftInstances.filter(
    (i) => i.context.site && sites.includes(i.context.site as PalpationSite)
  );

  const palpationContext = { palpationMode };

  const rightResult = validatePalpationCompletion(filteredRight, getValues, palpationContext);
  const leftResult = validatePalpationCompletion(filteredLeft, getValues, palpationContext);
  if (rightResult.valid && leftResult.valid) return "completed";

  // Check if explicitly skipped (checked last so real data takes priority)
  const skippedSteps = getValues("_skippedSteps") as string[] | undefined;
  if (skippedSteps?.includes(stepId)) return "skipped";

  return null;
}

// =============================================================================
// PalpationSubsection (refactored with sites/showDiagram props)
// =============================================================================

interface PalpationSubsectionProps {
  side: Side;
  /** Which sites to show on this step */
  sites: readonly PalpationSite[];
  instances: QuestionInstance[];
  expanded: PalpationSite | null;
  onExpandChange: (site: PalpationSite | null) => void;
  incompleteSites: IncompletePalpationSite[];
  palpationMode: PalpationMode;
  /** Whether to show the head diagram (false for TMJ steps) */
  showDiagram?: boolean;
}

function PalpationSubsection({
  side,
  sites,
  instances,
  expanded,
  onExpandChange,
  incompleteSites,
  palpationMode,
  showDiagram = true,
}: PalpationSubsectionProps) {
  const { watch } = useFormContext<FormValues>();
  const sideLabel = side === "right" ? "Rechte Seite" : "Linke Seite";
  const prefix = `e9.${side}`;

  // Watch all instance paths to trigger re-renders
  const watchPaths = instances.map((i) => i.path);
  watch(watchPaths);

  // Compute site statuses for the diagram (only for current step's sites)
  const computeStatuses = useCallback((): Partial<Record<PalpationSite, SiteStatus>> => {
    const statuses: Partial<Record<PalpationSite, SiteStatus>> = {};
    for (const site of sites) {
      statuses[site] = computeSiteStatus(site, prefix, watch);
    }
    return statuses;
  }, [sites, prefix, watch]);

  const siteStatuses = computeStatuses();

  // Get instances for a specific site
  const getSiteInstances = useCallback(
    (site: PalpationSite) => instances.filter((i) => i.context.site === site),
    [instances]
  );

  // Get incomplete site for a specific site (for dropdown error styling)
  const getIncompleteSite = useCallback(
    (site: PalpationSite): DropdownIncompleteSite | undefined => {
      const incomplete = incompleteSites.find((s) => s.site === site && s.side === side);
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

  // Table layout for single-site TMJ steps (no diagram, matching E7/E8 styling)
  if (!showDiagram && sites.length === 1) {
    const site = sites[0];
    const siteInstances = getSiteInstances(site);
    const siteConfig = SITE_CONFIG[site];
    const modeQuestions = PALPATION_MODE_QUESTIONS[palpationMode];
    const tmjSideLabel = side === "right" ? "Rechtes Kiefergelenk" : "Linkes Kiefergelenk";

    const applicablePainTypes = modeQuestions.filter((q) => {
      if (q === "familiarHeadache") return siteConfig.hasHeadache;
      if (q === "spreadingPain") return siteConfig.hasSpreading;
      return true;
    });

    const instanceMap = new Map<string, QuestionInstance>();
    for (const inst of siteInstances) {
      if (inst.context.painType) {
        instanceMap.set(inst.context.painType, inst);
      }
    }

    const painInstance = instanceMap.get("pain");
    const painValue = painInstance ? (watch(painInstance.path) as unknown as string | null) : null;
    const isQuestionEnabled = (painType: string) => painType === "pain" || painValue === "yes";
    const incomplete = getIncompleteSite(site);

    return (
      <div>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left text-sm font-medium p-3" colSpan={2}>
                  {tmjSideLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {PAIN_TYPE_ORDER.map((painType) => {
                if (!applicablePainTypes.includes(painType)) return null;
                const instance = instanceMap.get(painType);
                if (!instance) return null;

                const enabled = isQuestionEnabled(painType);
                const hasFieldError = incomplete?.missingQuestions.includes(painType);

                return (
                  <tr
                    key={painType}
                    className={cn("border-t", hasFieldError && "bg-destructive/10")}
                  >
                    <td
                      className={cn(
                        "p-3 text-sm font-medium",
                        !enabled && "text-muted-foreground",
                        hasFieldError && "text-destructive"
                      )}
                    >
                      {getPainTypeLabel(painType as PainType)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <YesNoField
                          name={instance.path as FieldPath<FieldValues>}
                          disabled={!enabled}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">{sideLabel}</span>

      {/* HeadDiagramPalpation - only shown for temporalis/masseter steps */}
      {showDiagram && (
        <HeadDiagramPalpation
          side={side}
          siteStatuses={siteStatuses}
          selectedSite={expanded}
          onSiteClick={handleSiteClick}
          incompleteSites={diagramIncompleteSites}
          visibleSites={sites}
        />
      )}

      {/* PalpationSiteDropdowns - filtered to current step's sites */}
      <div className="w-80 space-y-2">
        {sites.map((site) => (
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

// =============================================================================
// E9Section Main Component
// =============================================================================

export function E9Section({
  step,
  onStepChange,
  onComplete,
  onBack,
  isFirstSection,
  isLastSection = true,
}: E9SectionProps) {
  const { getInstancesForStep } = useExaminationForm();
  const { watch, setValue, getValues, clearErrors } = useFormContext<FormValues>();
  const activeStepRef = useScrollToActiveStep(step ?? 0);

  const rightInstances = getInstancesForStep("e9-right");
  const leftInstances = getInstancesForStep("e9-left");
  const palpationMode = watch("e9.palpationMode") as PalpationMode;

  // Build mode-aware instruction content (re-computed when mode changes)
  const e9Instructions = useMemo(() => createE9RichInstructions(palpationMode), [palpationMode]);
  const e9StepInstructions = useMemo(
    (): Record<E9StepId, E9RichInstructions[keyof E9RichInstructions]> => ({
      "e9-temporalis": e9Instructions.temporalisPalpation,
      "e9-masseter": e9Instructions.masseterPalpation,
      "e9-tmj-lateral": e9Instructions.tmjLateralPole,
      "e9-tmj-around": e9Instructions.tmjAroundPole,
    }),
    [e9Instructions]
  );

  // Track expanded dropdown for each side
  const [expanded, setExpanded] = useState<ExpandedState>({ left: null, right: null });
  // Only show validation errors after user clicks Next (reset on step change)
  const [hasValidated, setHasValidated] = useState(false);
  // Per-step refusal state (not persisted in form — data is cleared when refused)
  const [stepRefusals, setStepRefusals] = useState<Partial<Record<E9StepId, boolean>>>({});

  // Handle per-step refusal toggle
  const handleStepRefusalChange = useCallback(
    (stepId: E9StepId, refused: boolean) => {
      setStepRefusals((prev) => ({ ...prev, [stepId]: refused }));
      if (refused) {
        // Clear all data for this step's sites on both sides
        const sites = E9_STEP_SITES[stepId];
        for (const side of ["right", "left"] as Side[]) {
          const sideInstances = side === "right" ? rightInstances : leftInstances;
          const filtered = sideInstances.filter(
            (i) => i.context.site && sites.includes(i.context.site as PalpationSite)
          );
          for (const inst of filtered) {
            if (inst.renderType === "yesNo") {
              setInstanceValue(setValue, inst.path, null);
              clearInstanceErrors(clearErrors, inst.path);
            }
          }
        }
      }
    },
    [rightInstances, leftInstances, setValue, clearErrors]
  );

  // Compute step statuses from form state on mount (like E4Section)
  // Using useState instead of useMemo so that checking RF doesn't auto-advance
  const [stepStatuses, setStepStatuses] = useState<
    Record<string, "completed" | "skipped" | "refused">
  >(() => {
    const statuses: Record<string, "completed" | "skipped" | "refused"> = {};
    for (const stepId of E9_STEP_ORDER) {
      if (stepRefusals[stepId]) {
        statuses[stepId] = "refused";
        continue;
      }
      const status = computeE9StepStatus(
        stepId,
        palpationMode,
        rightInstances,
        leftInstances,
        (path) => getValues(path as FieldPath<FormValues>)
      );
      if (status) statuses[stepId] = status;
    }
    return statuses;
  });

  // Derive currentStepIndex from URL prop
  const currentStepIndex = useMemo(() => {
    if (step !== undefined) {
      const index = step - 1; // Convert 1-indexed to 0-indexed
      if (index >= 0 && index < E9_STEP_ORDER.length) {
        return index;
      }
    }
    // Auto-detect: find first incomplete step
    for (let i = 0; i < E9_STEP_ORDER.length; i++) {
      if (!stepStatuses[E9_STEP_ORDER[i]]) return i;
    }
    return -1; // All complete
  }, [step, stepStatuses]);

  const allComplete = currentStepIndex === -1;
  const currentStepId = allComplete ? E9_STEP_ORDER[0] : E9_STEP_ORDER[currentStepIndex];
  const isLastStep = currentStepIndex === E9_STEP_ORDER.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const currentSites = E9_STEP_SITES[currentStepId];

  // Filter instances for current step
  const filteredRight = useMemo(
    () =>
      currentSites.length > 0
        ? rightInstances.filter(
            (i) => i.context.site && currentSites.includes(i.context.site as PalpationSite)
          )
        : [],
    [rightInstances, currentSites]
  );
  const filteredLeft = useMemo(
    () =>
      currentSites.length > 0
        ? leftInstances.filter(
            (i) => i.context.site && currentSites.includes(i.context.site as PalpationSite)
          )
        : [],
    [leftInstances, currentSites]
  );

  // Subscribe to current step's fields for reactive skip button
  watch([...filteredRight, ...filteredLeft].map((i) => i.path));

  const isCurrentStepComplete =
    !allComplete &&
    (stepRefusals[currentStepId] === true ||
      computeE9StepStatus(
        currentStepId,
        palpationMode,
        filteredRight,
        filteredLeft,
        (path) => getValues(path as FieldPath<FormValues>)
      ) === "completed");
  const sectionIsDone = E9_STEP_ORDER.every((stepId) => {
    if (stepStatuses[stepId] || stepRefusals[stepId]) return true;
    const sites = E9_STEP_SITES[stepId];
    const filteredR = rightInstances.filter(
      (i) => i.context.site && sites.includes(i.context.site as PalpationSite)
    );
    const filteredL = leftInstances.filter(
      (i) => i.context.site && sites.includes(i.context.site as PalpationSite)
    );
    return (
      computeE9StepStatus(stepId, palpationMode, filteredR, filteredL, (path) =>
        getValues(path as FieldPath<FormValues>)
      ) === "completed"
    );
  });

  // Compute incomplete sites for current step
  const palpationContext = { palpationMode };
  const rightIncomplete =
    currentSites.length > 0
      ? validatePalpationCompletion(filteredRight, getValues, palpationContext).incompleteSites
      : [];
  const leftIncomplete =
    currentSites.length > 0
      ? validatePalpationCompletion(filteredLeft, getValues, palpationContext).incompleteSites
      : [];

  // Handle expanded state changes
  const handleExpandChange = useCallback((side: Side, site: PalpationSite | null) => {
    const otherSide = side === "left" ? "right" : "left";
    setExpanded({ [side]: site, [otherSide]: null } as ExpandedState);
  }, []);

  // Set all unanswered pain questions to "no" for current step
  const handleNoMorePainRegions = useCallback(() => {
    const allStepInstances = [...filteredRight, ...filteredLeft];
    const painInstances = allStepInstances.filter((i) => i.context.painType === "pain");
    for (const inst of painInstances) {
      const currentValue = getValues(inst.path as FieldPath<FormValues>);
      if (currentValue == null) {
        setInstanceValue(setValue, inst.path, "no");
      }
    }
    setHasValidated(false);
    setExpanded({ left: null, right: null });
  }, [filteredRight, filteredLeft, getValues, setValue]);

  // Navigation handlers
  const handleBack = () => {
    if (isFirstStep || allComplete) {
      onBack?.();
    } else {
      setHasValidated(false);
      setExpanded({ left: null, right: null });
      onStepChange?.(currentStepIndex - 1);
    }
  };

  const handleSectionSkip = () => {
    const stepsToSkip = E9_STEP_ORDER.filter(
      (stepId) => !stepStatuses[stepId] && !stepRefusals[stepId]
    );
    if (stepsToSkip.length > 0) {
      const currentSkipped =
        (getValues("_skippedSteps" as FieldPath<FormValues>) as unknown as string[] | undefined) ??
        [];
      setValue(
        "_skippedSteps" as FieldPath<FormValues>,
        [...currentSkipped, ...stepsToSkip] as never
      );
      setStepStatuses((prev) => {
        const next = { ...prev };
        for (const stepId of stepsToSkip) next[stepId] = "skipped";
        return next;
      });
    }
    onComplete?.();
  };

  const performSkip = () => {
    const currentSkipped =
      (getValues("_skippedSteps" as FieldPath<FormValues>) as unknown as string[] | undefined) ??
      [];
    setValue("_skippedSteps" as FieldPath<FormValues>, [...currentSkipped, currentStepId] as never);
    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "skipped" }));
    setHasValidated(false);
    setExpanded({ left: null, right: null });
    if (isLastStep) {
      onStepChange?.(null); // collapse to allComplete view
    } else {
      onStepChange?.(currentStepIndex + 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    // Refused steps are always valid
    if (stepRefusals[currentStepId]) {
      return true;
    }

    // For palpation steps, validate filtered instances on both sides
    const rightResult = validatePalpationCompletion(filteredRight, getValues, palpationContext);
    const leftResult = validatePalpationCompletion(filteredLeft, getValues, palpationContext);
    return rightResult.valid && leftResult.valid;
  };

  const handleNext = () => {
    // Check for step refusal - if refused, mark as refused and advance
    if (stepRefusals[currentStepId]) {
      setStepStatuses((prev) => ({ ...prev, [currentStepId]: "refused" }));
      setHasValidated(false);
      setExpanded({ left: null, right: null });
      if (isLastStep) {
        onStepChange?.(null); // collapse to allComplete view
      } else {
        onStepChange?.(currentStepIndex + 1);
      }
      return;
    }

    if (!validateCurrentStep()) {
      setHasValidated(true);
      return;
    }

    setStepStatuses((prev) => ({ ...prev, [currentStepId]: "completed" }));
    setHasValidated(false);
    setExpanded({ left: null, right: null });
    if (isLastStep) {
      onStepChange?.(null); // collapse to allComplete view
    } else {
      onStepChange?.(currentStepIndex + 1);
    }
  };

  // Validate all E9 data for final completion
  const validateAllE9 = (): boolean => {
    // If all palpation steps are refused, validation passes
    const allPalpationStepsRefused = E9_STEP_ORDER.every((id) => stepRefusals[id]);
    if (allPalpationStepsRefused) return true;

    // Otherwise, validate per-step: refused steps pass, others must be complete
    for (const stepId of E9_STEP_ORDER) {
      if (stepRefusals[stepId]) continue; // Refused steps are valid

      const sites = E9_STEP_SITES[stepId];
      const filteredR = rightInstances.filter(
        (i) => i.context.site && sites.includes(i.context.site as PalpationSite)
      );
      const filteredL = leftInstances.filter(
        (i) => i.context.site && sites.includes(i.context.site as PalpationSite)
      );
      const palpationCtx = { palpationMode };
      const rightResult = validatePalpationCompletion(filteredR, getValues, palpationCtx);
      const leftResult = validatePalpationCompletion(filteredL, getValues, palpationCtx);
      if (!rightResult.valid || !leftResult.valid) return false;
    }
    return true;
  };

  const getStepStatus = (stepId: E9StepId, index: number): StepStatus => {
    if (allComplete) {
      const status = stepStatuses[stepId];
      // Map "refused" to "completed" for StepBar display (will show RF badge via summary)
      if (status === "refused") return "completed";
      return status || "pending";
    }
    if (index === currentStepIndex) return "active";
    const status = stepStatuses[stepId];
    if (status === "refused") return "completed";
    return status || "pending";
  };

  // Get summary text for a step (for collapsed StepBar display)
  const getStepSummary = (stepId: E9StepId): string => {
    // Check for refused status first
    if (stepRefusals[stepId]) {
      return COMMON.refused;
    }

    const sites = E9_STEP_SITES[stepId];
    let hasPain = false;
    let hasFamiliarPain = false;
    let hasFamiliarHeadache = false;

    for (const side of ["right", "left"] as Side[]) {
      const prefix = `e9.${side}`;
      for (const site of sites) {
        const painVal = getValues(`${prefix}.${site}.pain` as FieldPath<FormValues>) as unknown as
          | string
          | null;
        const fpVal = getValues(
          `${prefix}.${site}.familiarPain` as FieldPath<FormValues>
        ) as unknown as string | null;
        const fhVal = getValues(
          `${prefix}.${site}.familiarHeadache` as FieldPath<FormValues>
        ) as unknown as string | null;
        if (painVal === "yes") hasPain = true;
        if (fpVal === "yes") hasFamiliarPain = true;
        if (fhVal === "yes") hasFamiliarHeadache = true;
      }
    }

    if (!hasPain) return "Kein Schmerz";
    if (hasFamiliarPain && hasFamiliarHeadache) return "Bek. Schmerz + Kopfschmerz";
    if (hasFamiliarPain) return "Bekannter Schmerz";
    if (hasFamiliarHeadache) return "Bekannter Kopfschmerz";
    return "Keine Übereinstimmung";
  };

  // Whether diagram should be shown for current step
  const showDiagram = currentStepId === "e9-temporalis" || currentStepId === "e9-masseter";

  // Render the instruction block for the current step
  const renderInstruction = (stepId: E9StepId) => {
    const instruction = e9StepInstructions[stepId];
    return (
      <IntroPanel title="Anweisungen">
        {isPainInterviewInstruction(instruction) ? (
          <PainInterviewBlock instruction={instruction} />
        ) : (
          <MeasurementFlowBlock instruction={instruction as RichMeasurementInstruction} />
        )}
      </IntroPanel>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getSectionCardTitle(SECTIONS.e9)}</CardTitle>
          <div className="flex items-center gap-3">
            <PalpationModeToggle
              value={palpationMode}
              onChange={(mode) => setValue("e9.palpationMode", mode)}
            />
            <SectionCommentButton sectionId="e9" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/protocol/$section" params={{ section: "e9" }}>
                <BookOpen className="h-4 w-4 mr-1" />
                Protokoll
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <IntroPanel title="Einführung Palpation">
          <MeasurementFlowBlock instruction={e9Instructions.introduction} />
        </IntroPanel>
        {E9_STEP_ORDER.map((stepId, index) => {
          const config = E9_STEP_CONFIG[stepId];
          const status = getStepStatus(stepId, index);

          if (status === "active") {
            return (
              <div
                key={stepId}
                ref={activeStepRef}
                className="scroll-mt-16 xl:scroll-mt-0 rounded-lg border border-primary/30 bg-card p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <Badge>{config.badge}</Badge>
                  <h3 className="font-semibold">{config.title}</h3>
                </div>

                {/* Instruction */}
                {renderInstruction(stepId)}

                {/* Content */}
                {stepRefusals[stepId] ? (
                  // Refused state: show message + checkbox to undo
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <p className="text-lg font-medium">{COMMON.refusedFull}</p>
                      <p className="text-sm">{COMMON.refusedTooltip}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${stepId}-refused`}
                        checked={true}
                        onCheckedChange={(checked) => {
                          handleStepRefusalChange(stepId, checked === true);
                        }}
                      />
                      <label
                        htmlFor={`${stepId}-refused`}
                        className="text-sm text-muted-foreground cursor-pointer select-none"
                        title={COMMON.refusedTooltip}
                      >
                        {COMMON.refusedFull}
                      </label>
                    </div>
                  </div>
                ) : (
                  // Palpation steps: bilateral subsections + refusal checkbox
                  <>
                    {showDiagram ? (
                      <>
                        <div className="flex justify-center items-start gap-8 md:gap-16">
                          <PalpationSubsection
                            side="right"
                            sites={currentSites}
                            instances={filteredRight}
                            expanded={expanded.right}
                            onExpandChange={(site) => handleExpandChange("right", site)}
                            incompleteSites={hasValidated ? rightIncomplete : []}
                            palpationMode={palpationMode}
                            showDiagram
                          />
                          <Separator
                            orientation="vertical"
                            className="hidden md:block h-auto self-stretch"
                          />
                          <PalpationSubsection
                            side="left"
                            sites={currentSites}
                            instances={filteredLeft}
                            expanded={expanded.left}
                            onExpandChange={(site) => handleExpandChange("left", site)}
                            incompleteSites={hasValidated ? leftIncomplete : []}
                            palpationMode={palpationMode}
                            showDiagram
                          />
                        </div>
                        <div className="flex justify-center pt-2">
                          <Button type="button" variant="outline" onClick={handleNoMorePainRegions}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Keine weiteren Schmerzbereiche
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PalpationSubsection
                          side="right"
                          sites={currentSites}
                          instances={filteredRight}
                          expanded={expanded.right}
                          onExpandChange={(site) => handleExpandChange("right", site)}
                          incompleteSites={hasValidated ? rightIncomplete : []}
                          palpationMode={palpationMode}
                          showDiagram={false}
                        />
                        <PalpationSubsection
                          side="left"
                          sites={currentSites}
                          instances={filteredLeft}
                          expanded={expanded.left}
                          onExpandChange={(site) => handleExpandChange("left", site)}
                          incompleteSites={hasValidated ? leftIncomplete : []}
                          palpationMode={palpationMode}
                          showDiagram={false}
                        />
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`${stepId}-refused`}
                          checked={false}
                          onCheckedChange={(checked) => {
                            handleStepRefusalChange(stepId, checked === true);
                          }}
                        />
                        <label
                          htmlFor={`${stepId}-refused`}
                          className="text-sm text-muted-foreground cursor-pointer select-none"
                          title={COMMON.refusedTooltip}
                        >
                          {COMMON.refusedFull}
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Step footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isFirstStep && (isFirstSection || !onBack)}
                    className="text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Zurück
                  </Button>
                  {/* Right: skip + Next/Abschließen buttons */}
                  <div className="flex items-center gap-2">
                    {!isCurrentStepComplete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={performSkip}
                        className="text-muted-foreground text-xs"
                      >
                        Schritt überspringen
                      </Button>
                    )}
                    <Button type="button" onClick={handleNext}>
                      {isLastStep ? "Abschließen" : "Weiter"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          }

          // Collapsed step - using StepBar component
          return (
            <StepBar
              key={stepId}
              config={config}
              status={status}
              summary={status === "pending" ? "—" : getStepSummary(stepId)}
              onClick={() => onStepChange?.(index)}
            />
          );
        })}
      </CardContent>

      {/* Section-level footer */}
      {(allComplete || sectionIsDone) ? (
        <SectionFooter
          onNext={() => {
            if (validateAllE9()) {
              onComplete?.();
            }
          }}
          onSkipConfirm={onComplete}
          onBack={onBack}
          isFirstStep={isFirstSection}
          isLastSection={isLastSection}
          directSkipLabel="Abschnitt überspringen"
        />
      ) : (
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSectionSkip}
            className="text-muted-foreground text-xs"
          >
            Abschnitt überspringen
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
