/**
 * Axis 2 Score Card - Displays PHQ-4 score summary with expandable details
 * Used in the dashboard for quick severity assessment before patient review
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  calculatePHQ4Score,
  getPHQ4Interpretation,
  getSubscaleInterpretation,
} from "@cmdetect/questionnaires";
import { PHQ4Summary } from "../PHQ4Summary";

interface Axis2ScoreCardProps {
  questionnaireId: string;
  title: string;
  answers: Record<string, string> | null;
  isPlaceholder?: boolean;
}

export function Axis2ScoreCard({
  questionnaireId,
  title,
  answers,
  isPlaceholder = false,
}: Axis2ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Placeholder card for future questionnaires (OBC, JFLS)
  if (isPlaceholder || !answers) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-muted-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {isPlaceholder ? "Demnächst verfügbar" : "Keine Daten"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Only PHQ-4 scoring is implemented
  if (questionnaireId !== "phq-4") {
    return (
      <div className="border rounded-lg p-4">
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Bewertung nicht verfügbar
        </p>
      </div>
    );
  }

  const score = calculatePHQ4Score(answers);
  const interpretation = getPHQ4Interpretation(score);
  const anxietyResult = getSubscaleInterpretation(score.anxiety);
  const depressionResult = getSubscaleInterpretation(score.depression);

  const severityColors: Record<string, string> = {
    none: "bg-green-100 text-green-800 border-green-200",
    mild: "bg-yellow-100 text-yellow-800 border-yellow-200",
    moderate: "bg-orange-100 text-orange-800 border-orange-200",
    severe: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Score summary header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium">{title}</h4>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-2xl font-bold">
                {score.total}
                <span className="text-base font-normal text-muted-foreground">
                  /{score.maxTotal}
                </span>
              </span>
              <Badge className={severityColors[interpretation.severity]}>
                {interpretation.text}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground"
          >
            {isExpanded ? (
              <>
                Ausblenden <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Details <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Subscale summary */}
        <div className="flex gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Angst:</span>
            <span className={anxietyResult.positive ? "text-orange-600 font-medium" : ""}>
              {score.anxiety}/{score.maxAnxiety}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Depression:</span>
            <span className={depressionResult.positive ? "text-orange-600 font-medium" : ""}>
              {score.depression}/{score.maxDepression}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable details */}
      {isExpanded && (
        <div className="border-t bg-muted/20 p-4">
          <PHQ4Summary answers={answers} />
        </div>
      )}
    </div>
  );
}
