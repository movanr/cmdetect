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
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { QuestionField } from "../QuestionField";
import { SectionFooter } from "../ui";

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
        <div className="max-w-sm mx-auto space-y-8">
          {/* Reference Tooth */}
          <div className="space-y-4">
            <h4 className="font-medium">Referenzzahn</h4>
            <div className="space-y-4">
              {referenceToothSelection && <QuestionField instance={referenceToothSelection} />}
              {referenceToothOther && <QuestionField instance={referenceToothOther} />}
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-4">
            <h4 className="font-medium">Messungen</h4>
            <div className="space-y-4">
              {horizontalOverjet && (
                <QuestionField instance={horizontalOverjet} label="Horizontaler Overjet" />
              )}
              {verticalOverlap && (
                <QuestionField instance={verticalOverlap} label="Vertikaler Overlap" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">Negative Werte möglich</p>
          </div>

          {/* Midline Deviation */}
          <div className="space-y-4">
            <h4 className="font-medium">Mittellinienabweichung</h4>
            <div className="space-y-4">
              {midlineDirection && <QuestionField instance={midlineDirection} label="Richtung" />}
              {midlineMm && <QuestionField instance={midlineMm} label="Abweichung" />}
            </div>
          </div>
        </div>
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkip={onSkip}
        onBack={onBack}
        isFirstStep={isFirstSection}
        warnOnSkip
        checkIncomplete={() => !validateStep("e2-all")}
      />
    </Card>
  );
}
