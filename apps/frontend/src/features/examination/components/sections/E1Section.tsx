/**
 * E1: Pain & Headache Location Section
 *
 * Displays bilateral checkbox groups for:
 * - E1a: Pain location in the last 30 days
 * - E1b: Headache location in the last 30 days
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle } from "../../labels";
import { QuestionField } from "../QuestionField";
import { SectionFooter } from "../ui";

interface E1SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function E1Section({ onComplete, onSkip }: E1SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();

  const allInstances = getInstancesForStep("e1-all");

  // Split instances by type and side
  const painRight = allInstances.find((i) => i.path === "e1.painLocation.right");
  const painLeft = allInstances.find((i) => i.path === "e1.painLocation.left");
  const headacheRight = allInstances.find((i) => i.path === "e1.headacheLocation.right");
  const headacheLeft = allInstances.find((i) => i.path === "e1.headacheLocation.left");

  const handleNext = () => {
    const isValid = validateStep("e1-all");
    if (isValid) {
      onComplete?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getSectionCardTitle(SECTIONS.e1)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* E1A: Pain Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U1A</Badge>
            <h4 className="font-medium">Schmerzlokalisation (letzte 30 Tage)</h4>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Rechte Seite</h5>
              {painRight && <QuestionField instance={painRight} />}
            </div>
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Linke Seite</h5>
              {painLeft && <QuestionField instance={painLeft} />}
            </div>
          </div>
        </div>

        {/* E1B: Headache Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">U1B</Badge>
            <h4 className="font-medium">Kopfschmerzlokalisation (letzte 30 Tage)</h4>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Rechte Seite</h5>
              {headacheRight && <QuestionField instance={headacheRight} />}
            </div>
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Linke Seite</h5>
              {headacheLeft && <QuestionField instance={headacheLeft} />}
            </div>
          </div>
        </div>
      </CardContent>
      <SectionFooter onNext={handleNext} onSkip={onSkip} />
    </Card>
  );
}
