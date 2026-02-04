/**
 * E3: Opening Pattern Section (Supplemental)
 *
 * Single selection with 4 options:
 * - Gerade
 * - Korrigierte Deviation
 * - Unkorrigierte Deviation nach rechts
 * - Unkorrigierte Deviation nach links
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SECTIONS } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>{getSectionCardTitle(SECTIONS.e3)}</CardTitle>
          <Badge variant="secondary">Zusatz</Badge>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/protocol/$section" params={{ section: "e3" }}>
            <BookOpen className="h-4 w-4 mr-1" />
            Protokoll
          </Link>
        </Button>
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
