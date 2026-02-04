/**
 * E2: Incisal Relationships Section
 *
 * Displays:
 * - Reference tooth selection (enum)
 * - Horizontal overjet measurement
 * - Vertical overlap measurement
 * - Midline deviation (direction + conditional mm)
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { E2_RICH_INSTRUCTIONS } from "../../content/instructions";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { QuestionField } from "../QuestionField";
import { MeasurementFlowBlock, SectionFooter } from "../ui";

interface E2SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  isFirstSection?: boolean;
}

export function E2Section({ onComplete, onSkip, onBack, isFirstSection }: E2SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();

  const instances = getInstancesForStep("e2-all");

  // Find specific instances for layout
  const referenceToothSelection = instances.find((i) => i.path === "e2.referenceTooth.selection");
  const referenceToothOther = instances.find((i) => i.path === "e2.referenceTooth.otherTooth");
  const horizontalOverjet = instances.find((i) => i.path === "e2.horizontalOverjet");
  const verticalOverlap = instances.find((i) => i.path === "e2.verticalOverlap");
  const midlineDirection = instances.find((i) => i.path === "e2.midlineDeviation.direction");
  const midlineMm = instances.find((i) => i.path === "e2.midlineDeviation.mm");

  const handleNext = () => {
    const isValid = validateStep("e2-all");
    if (isValid) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{getSectionCardTitle(SECTIONS.e2)}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/protocol/$section" params={{ section: "e2" }}>
            <BookOpen className="h-4 w-4 mr-1" />
            Protokoll
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="max-w-md mx-auto space-y-8">
          {/* Reference Tooth */}
          <div className="space-y-4">
            <MeasurementFlowBlock instruction={E2_RICH_INSTRUCTIONS.referenceTooth} />
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {referenceToothSelection && <QuestionField instance={referenceToothSelection} />}
              {referenceToothOther && <QuestionField instance={referenceToothOther} />}
            </div>
          </div>

          {/* Midline Deviation */}
          <div className="space-y-4">
            <MeasurementFlowBlock instruction={E2_RICH_INSTRUCTIONS.midlineDeviation} />
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {midlineDirection && <QuestionField instance={midlineDirection} label="Richtung" />}
              {midlineMm && <QuestionField instance={midlineMm} label="Abweichung" />}
            </div>
          </div>

          {/* Horizontal Overjet */}
          <div className="space-y-4">
            <MeasurementFlowBlock instruction={E2_RICH_INSTRUCTIONS.horizontalOverjet} />
            <div className="pl-4 border-l-2 border-muted">
              {horizontalOverjet && (
                <QuestionField instance={horizontalOverjet} label="Horizontaler Overjet" />
              )}
              <p className="text-xs text-muted-foreground mt-1">Negativer Wert bei Kreuzbiss</p>
            </div>
          </div>

          {/* Vertical Overlap */}
          <div className="space-y-4">
            <MeasurementFlowBlock instruction={E2_RICH_INSTRUCTIONS.verticalOverlap} />
            <div className="pl-4 border-l-2 border-muted">
              {verticalOverlap && (
                <QuestionField instance={verticalOverlap} label="Vertikaler Overlap" />
              )}
              <p className="text-xs text-muted-foreground mt-1">Negativer Wert bei offenem Biss</p>
            </div>
          </div>
        </div>
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkipConfirm={onSkip}
        onBack={onBack}
        isFirstStep={isFirstSection}
        warnOnSkip
        checkIncomplete={() => !validateStep("e2-all")}
      />
    </Card>
  );
}
