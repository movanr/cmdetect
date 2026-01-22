/**
 * E2: Incisal Relationships Section
 *
 * Displays:
 * - Reference tooth selection (enum)
 * - Horizontal overjet measurement
 * - Vertical overlap measurement
 * - Midline deviation (direction + conditional mm)
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExaminationForm } from "../../form/use-examination-form";
import { QuestionField } from "../QuestionField";
import { SectionFooter } from "../ui";

interface E2SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function E2Section({ onComplete, onSkip }: E2SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();

  const instances = getInstancesForStep("e2-all");

  // Find specific instances for layout
  const referenceTooth = instances.find((i) => i.path === "e2.referenceTooth");
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
      <CardHeader>
        <CardTitle>U2 - Schneidezahnbeziehungen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Reference Tooth */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U2</Badge>
            <h4 className="font-medium">Referenzzahn</h4>
          </div>
          {referenceTooth && <QuestionField instance={referenceTooth} />}
        </div>

        {/* Measurements */}
        <div className="space-y-4">
          <h4 className="font-medium">Messungen</h4>
          <div className="grid grid-cols-2 gap-6">
            {horizontalOverjet && (
              <QuestionField instance={horizontalOverjet} label="Horizontaler Overjet" />
            )}
            {verticalOverlap && (
              <QuestionField instance={verticalOverlap} label="Vertikaler Overlap" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Negative Werte: Overjet bei anteriorem Kreuzbiss, Overlap bei anteriorem offenen Biss
          </p>
        </div>

        {/* Midline Deviation */}
        <div className="space-y-4">
          <h4 className="font-medium">Mittellinienabweichung</h4>
          <div className="space-y-4">
            {midlineDirection && <QuestionField instance={midlineDirection} label="Richtung" />}
            {midlineMm && <QuestionField instance={midlineMm} label="Abweichung" />}
          </div>
        </div>
      </CardContent>
      <SectionFooter onNext={handleNext} onSkip={onSkip} />
    </Card>
  );
}
