/**
 * E3: Opening Pattern Section (Supplemental)
 *
 * Displays:
 * - Opening pattern selection (straight or corrected deviation)
 * - Conditional uncorrected deviation direction
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExaminationForm } from "../../form/use-examination-form";
import { QuestionField } from "../QuestionField";
import { SectionFooter } from "../ui";

interface E3SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function E3Section({ onComplete, onSkip }: E3SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();

  const instances = getInstancesForStep("e3-all");

  // Find specific instances for layout
  const pattern = instances.find((i) => i.path === "e3.pattern");
  const uncorrectedDeviation = instances.find((i) => i.path === "e3.uncorrectedDeviation");

  const handleNext = () => {
    const isValid = validateStep("e3-all");
    if (isValid) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>U3 - Öffnungsmuster</CardTitle>
          <Badge variant="secondary">Zusatz</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Opening Pattern */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U3</Badge>
            <h4 className="font-medium">Muster</h4>
          </div>
          {pattern && <QuestionField instance={pattern} />}
        </div>

        {/* Uncorrected Deviation Direction - conditional via enableWhen */}
        <div className="space-y-4">
          <h4 className="font-medium">Unkorrigierte Deviation</h4>
          {uncorrectedDeviation && (
            <QuestionField instance={uncorrectedDeviation} label="Richtung der Deviation" />
          )}
        </div>
      </CardContent>
      <SectionFooter onNext={handleNext} onSkip={onSkip} />
    </Card>
  );
}
