import { SECTIONS } from "@cmdetect/dc-tmd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { SIDES, type PalpationMode, type SiteDetailMode } from "../../model/regions";
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

  const handleNext = () => {
    const isValid = validateStep("e9-right") && validateStep("e9-left");
    if (isValid) {
      onComplete?.();
    }
  };

  const rightInstances = getInstancesForStep("e9-right");
  const leftInstances = getInstancesForStep("e9-left");
  const palpationMode = watch("e9.palpationMode") as PalpationMode;
  const siteDetailMode = watch("e9.siteDetailMode") as SiteDetailMode;

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
          <TablePalpationStep
            key="right"
            instances={rightInstances}
            palpationMode={palpationMode}
            siteDetailMode={siteDetailMode}
          />
        </div>

        {/* Left side */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1">
            {SIDES.left}
          </h3>
          <TablePalpationStep
            key="left"
            instances={leftInstances}
            palpationMode={palpationMode}
            siteDetailMode={siteDetailMode}
          />
        </div>
      </CardContent>
      <SectionFooter onNext={handleNext} onSkip={onSkip} isLastSection={isLastSection} />
    </Card>
  );
}
