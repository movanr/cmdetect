/**
 * Progress indicator for the questionnaire wizard
 * Shows section-based progress with optional sub-question counter
 */

import { Progress } from "@/components/ui/progress";

type ProgressHeaderProps = {
  sectionIndex: number;
  totalSections: number;
  sectionName: string;
  questionInSection: number;
  totalInSection: number;
};

export function ProgressHeader({
  sectionIndex,
  totalSections,
  sectionName,
  questionInSection,
  totalInSection,
}: ProgressHeaderProps) {
  // Progress is based on sections (each section = 100/totalSections %)
  // Add partial progress for current section based on question position
  const sectionProgress = (sectionIndex / totalSections) * 100;
  const questionProgress =
    ((questionInSection - 1) / totalInSection) * (100 / totalSections);
  const percentage = Math.round(sectionProgress + questionProgress);

  // Only show sub-question counter if section has more than 1 question
  const showSubCounter = totalInSection > 1;

  return (
    <div className="space-y-2">
      <Progress value={percentage} className="h-2" />
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Section {sectionIndex + 1} of {totalSections} · {sectionName}
        </p>
        {showSubCounter && (
          <p className="text-xs text-muted-foreground">
            Question {questionInSection} of {totalInSection}
          </p>
        )}
      </div>
    </div>
  );
}
