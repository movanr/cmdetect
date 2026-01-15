/**
 * QuestioningPanel - UI for asking pain interview questions.
 *
 * Displayed when a region is selected:
 * - Shows region name and side
 * - Displays current question with progress indicator
 * - Large Yes/No buttons for easy interaction
 * - Cancel button to abort without saving
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Side } from "../../model/side";
import { type RegionId, type QuestionType, parseRegionId, INTERACTIVE_REGIONS } from "./types";

/**
 * Labels for interactive regions.
 */
const REGION_LABELS: Record<string, string> = {
  [INTERACTIVE_REGIONS.TEMPORALIS]: "Temporalis",
  [INTERACTIVE_REGIONS.MASSETER]: "Masseter",
  [INTERACTIVE_REGIONS.TMJ]: "Kiefergelenk",
  [INTERACTIVE_REGIONS.NON_MAST]: "Nicht-Kaumuskulatur",
  [INTERACTIVE_REGIONS.OTHER_MAST]: "Andere Kaumuskeln",
};

/**
 * Labels for sides.
 */
const SIDE_LABELS: Record<Side, string> = {
  left: "Links",
  right: "Rechts",
};

/**
 * Question text for each question type.
 */
const QUESTION_LABELS: Record<QuestionType, string> = {
  pain: "Schmerz?",
  familiarPain: "Bekannter Schmerz?",
  familiarHeadache: "Bekannte Kopfschmerzen?",
};

interface QuestioningPanelProps {
  /** The region being questioned */
  regionId: RegionId;
  /** Current question type */
  question: QuestionType;
  /** Current question index (0-based) */
  questionIndex: number;
  /** Total number of questions for this region */
  totalQuestions: number;
  /** Callback when Yes is clicked */
  onYes: () => void;
  /** Callback when No is clicked */
  onNo: () => void;
  /** Callback when Cancel is clicked */
  onCancel: () => void;
  /** Optional className */
  className?: string;
}

export function QuestioningPanel({
  regionId,
  question,
  questionIndex,
  totalQuestions,
  onYes,
  onNo,
  onCancel,
  className,
}: QuestioningPanelProps) {
  const { side, region } = parseRegionId(regionId);

  return (
    <Card
      className={cn(
        "animate-in slide-in-from-bottom-4 duration-200",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">
              {SIDE_LABELS[side]} {REGION_LABELS[region]}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {questionIndex + 1} von {totalQuestions}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onCancel}
            aria-label="Abbrechen"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium text-center py-2">
          {QUESTION_LABELS[question]}
        </p>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1 h-12 text-base"
            onClick={onNo}
          >
            Nein
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1 h-12 text-base"
            onClick={onYes}
          >
            Ja
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
