/**
 * SQ Status Card - Shows review status with expandable details
 * Allows starting the interactive review wizard with the patient
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  SQ_OFFICE_USE_QUESTIONS,
  SQ_ENABLE_WHEN,
  isQuestionIdEnabled,
} from "@cmdetect/questionnaires";
import { formatDistanceToNow } from "@/lib/date-utils";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import { SQReadOnlyView } from "./SQReadOnlyView";

interface SQStatusCardProps {
  response: QuestionnaireResponse | undefined;
  onStartReview: () => void;
}

/**
 * Count pending office-use confirmations
 */
function countPendingConfirmations(answers: Record<string, unknown>): number {
  return Array.from(SQ_OFFICE_USE_QUESTIONS).filter((qId) => {
    if (!isQuestionIdEnabled(qId, SQ_ENABLE_WHEN, answers)) return false;
    if (answers[qId] !== "yes") return false;

    const officeUseKey = `${qId}_office`;
    const officeUse = answers[officeUseKey] as
      | { R?: boolean; L?: boolean; DNK?: boolean }
      | undefined;

    return !officeUse?.R && !officeUse?.L && !officeUse?.DNK;
  }).length;
}

export function SQStatusCard({
  response,
  onStartReview,
}: SQStatusCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // No SQ data
  if (!response) {
    return (
      <div className="border rounded-lg p-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <div>
            <h4 className="font-medium">DC/TMD Symptomfragebogen</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Noch nicht eingereicht
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { answers, submittedAt, reviewedAt } = response;
  const pendingConfirmations = countPendingConfirmations(answers);
  const isReviewed = !!reviewedAt;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">DC/TMD Symptomfragebogen</h4>
              {isReviewed ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Überprüft
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Ausstehend
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              Eingereicht{" "}
              {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
              {isReviewed && reviewedAt && (
                <>
                  {" "}
                  · Überprüft{" "}
                  {formatDistanceToNow(new Date(reviewedAt), { addSuffix: true })}
                </>
              )}
            </p>

            {/* Pending confirmations warning */}
            {pendingConfirmations > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {pendingConfirmations}{" "}
                  {pendingConfirmations === 1
                    ? "Frage benötigt"
                    : "Fragen benötigen"}{" "}
                  Seitenbestätigung
                </span>
              </div>
            )}
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

        {/* Start review button */}
        <div className="mt-4">
          <Button onClick={onStartReview} className="w-full sm:w-auto">
            <PlayCircle className="mr-2 h-4 w-4" />
            {isReviewed
              ? "Erneut mit Patient überprüfen"
              : "Überprüfung mit Patient starten"}
          </Button>
        </div>
      </div>

      {/* Expandable details */}
      {isExpanded && (
        <div className="border-t bg-muted/20 p-4">
          <SQReadOnlyView answers={answers} />
        </div>
      )}
    </div>
  );
}
