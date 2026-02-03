import { SECTIONS } from "@cmdetect/dc-tmd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import {
  PALPATION_SITE_KEYS,
  SIDES,
  type PalpationMode,
  type PalpationSite,
  type SiteDetailMode,
} from "../../model/regions";
import { HeadDiagramPalpation } from "../HeadDiagram";
import type { SiteStatus } from "../HeadDiagram/types";
import { PalpationModeToggle } from "../inputs/PalpationModeToggle";
import { SiteDetailModeToggle } from "../inputs/SiteDetailModeToggle";
import { SectionFooter, TablePalpationStep } from "../ui";

interface E9SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
  /** If true, shows "Abschließen" instead of "Weiter" */
  isLastSection?: boolean;
}

export function E9Section({ onComplete, onSkip, isLastSection = true }: E9SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();
  const { watch, setValue } = useFormContext();

  const rightInstances = getInstancesForStep("e9-right");
  const leftInstances = getInstancesForStep("e9-left");
  const palpationMode = watch("e9.palpationMode") as PalpationMode;
  const siteDetailMode = watch("e9.siteDetailMode") as SiteDetailMode;

  // Track selected site for each side (for visual highlighting)
  const [selectedSite, setSelectedSite] = useState<{
    left: PalpationSite | null;
    right: PalpationSite | null;
  }>({ left: null, right: null });

  // Helper to compute site status from form values
  const computeSiteStatuses = useCallback(
    (side: "left" | "right"): Partial<Record<PalpationSite, SiteStatus>> => {
      const prefix = `e9.${side}`;
      const statuses: Partial<Record<PalpationSite, SiteStatus>> = {};

      for (const site of PALPATION_SITE_KEYS) {
        const painPath = `${prefix}.${site}.pain`;
        const familiarPainPath = `${prefix}.${site}.familiarPain`;
        const familiarHeadachePath = `${prefix}.${site}.familiarHeadache`;

        const painValue = watch(painPath);
        const familiarPainValue = watch(familiarPainPath);
        const familiarHeadacheValue = watch(familiarHeadachePath);

        const hasData = painValue === "yes" || painValue === "no";
        const isPainPositive = painValue === "yes";
        const hasFamiliarPainData =
          familiarPainValue === "yes" || familiarPainValue === "no";
        const hasFamiliarPain = familiarPainValue === "yes";
        const hasFamiliarHeadacheData =
          familiarHeadacheValue === "yes" || familiarHeadacheValue === "no";
        const hasFamiliarHeadache = familiarHeadacheValue === "yes";

        // Complete if: no pain, OR pain with all follow-ups answered
        const isComplete =
          hasData &&
          (!isPainPositive ||
            (hasFamiliarPainData &&
              (hasFamiliarHeadacheData || !site.startsWith("temporalis"))));

        statuses[site] = {
          hasData,
          isPainPositive,
          hasFamiliarPainData,
          hasFamiliarPain,
          hasFamiliarHeadacheData,
          hasFamiliarHeadache,
          isComplete,
        };
      }

      return statuses;
    },
    [watch]
  );

  // Memoize site statuses for both sides
  const rightSiteStatuses = useMemo(
    () => computeSiteStatuses("right"),
    [computeSiteStatuses]
  );
  const leftSiteStatuses = useMemo(
    () => computeSiteStatuses("left"),
    [computeSiteStatuses]
  );

  // Handle site click - in grouped mode, select the first site of the group
  const handleSiteClick = useCallback(
    (side: "left" | "right", site: PalpationSite) => {
      // Toggle selection - if same site clicked, deselect
      setSelectedSite((prev) => ({
        ...prev,
        [side]: prev[side] === site ? null : site,
      }));
    },
    []
  );

  // Extract validation logic to avoid duplication between handleNext and checkIncomplete
  const validateE9 = () => {
    const palpationContext = { palpationMode, siteDetailMode };
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
        <div className="flex gap-2">
          <PalpationModeToggle
            value={palpationMode}
            onChange={(mode) => setValue("e9.palpationMode", mode)}
          />
          <SiteDetailModeToggle
            value={siteDetailMode}
            onChange={(mode) => setValue("e9.siteDetailMode", mode)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Right side */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
            {SIDES.right}
          </h3>
          <div className="flex flex-col lg:flex-row items-start gap-4">
            <HeadDiagramPalpation
              side="right"
              siteStatuses={rightSiteStatuses}
              selectedSite={selectedSite.right}
              onSiteClick={(site) => handleSiteClick("right", site)}
              siteDetailMode={siteDetailMode}
            />
            <div className="flex-1 min-w-0">
              <TablePalpationStep
                key="right"
                instances={rightInstances}
                palpationMode={palpationMode}
                siteDetailMode={siteDetailMode}
              />
            </div>
          </div>
        </div>

        {/* Left side */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
            {SIDES.left}
          </h3>
          <div className="flex flex-col lg:flex-row items-start gap-4">
            <HeadDiagramPalpation
              side="left"
              siteStatuses={leftSiteStatuses}
              selectedSite={selectedSite.left}
              onSiteClick={(site) => handleSiteClick("left", site)}
              siteDetailMode={siteDetailMode}
            />
            <div className="flex-1 min-w-0">
              <TablePalpationStep
                key="left"
                instances={leftInstances}
                palpationMode={palpationMode}
                siteDetailMode={siteDetailMode}
              />
            </div>
          </div>
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
