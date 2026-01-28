/**
 * E3: Opening Pattern Section (Supplemental)
 *
 * Single selection with 4 options:
 * - Gerade
 * - Korrigierte Deviation
 * - Unkorrigierte Deviation nach rechts
 * - Unkorrigierte Deviation nach links
 */

import { SECTIONS } from "@cmdetect/dc-tmd";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExaminationForm } from "../../form/use-examination-form";
import { getSectionCardTitle, SECTION_LABELS } from "../../labels";
import { QuestionField } from "../QuestionField";
import { SectionFooter } from "../ui";

interface E3SectionProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function E3Section({ onComplete, onSkip }: E3SectionProps) {
  const { getInstancesForStep, validateStep } = useExaminationForm();

  const instances = getInstancesForStep("e3-all");
  const pattern = instances.find((i) => i.path === "e3.pattern");

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
          <CardTitle>{getSectionCardTitle(SECTIONS.e3)}</CardTitle>
          <Badge variant="secondary">Zusatz</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-w-sm mx-auto space-y-4">
          <h4 className="font-medium">{SECTION_LABELS.e3.full}</h4>
          {pattern && <QuestionField instance={pattern} />}
        </div>
      </CardContent>
      <SectionFooter
        onNext={handleNext}
        onSkip={onSkip}
        warnOnSkip
        checkIncomplete={() => !validateStep("e3-all")}
      />
    </Card>
  );
}
