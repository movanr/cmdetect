/**
 * SQ Status Card - Shows review status with expandable details
 * Allows starting the interactive review wizard with the patient
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
  SQ_ENABLE_WHEN,
  SQ_OFFICE_USE_QUESTIONS,
  isQuestionIdEnabled,
} from "@cmdetect/questionnaires";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { QuestionnaireResponse } from "../../hooks/useQuestionnaireResponses";
import { SQAnswersTable } from "./questionnaire-tables";

interface SQStatusCardProps {
  response: QuestionnaireResponse | undefined;
  /** Whether SQ screening is negative (all screening questions answered "no") */
  isScreeningNegative?: boolean;
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

export function SQStatusCard({ response, isScreeningNegative = false }: SQStatusCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // No SQ data
  if (!response) {
    return (
      <Card className="bg-muted/30 py-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">SF - DC/TMD Symptomfragebogen</h4>
              <p className="text-sm text-muted-foreground mt-1">Noch nicht eingereicht</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { answers, submittedAt, reviewedAt } = response;
  const pendingConfirmations = isScreeningNegative ? 0 : countPendingConfirmations(answers);
  const isReviewed = !!reviewedAt;

  return (
    <Card className="overflow-hidden py-0 gap-0">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">SF - DC/TMD Symptomfragebogen</h4>
              {isScreeningNegative ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Negativ
                </Badge>
              ) : isReviewed ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Überprüft
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  Überprüfung mit Patient ausstehend
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              Eingereicht {formatDistanceToNow(new Date(submittedAt), { addSuffix: true })}
              {isReviewed && reviewedAt && (
                <> · Überprüft {formatDistanceToNow(new Date(reviewedAt), { addSuffix: true })}</>
              )}
            </p>

            {/* Negative screening message */}
            {isScreeningNegative && (
              <p className="text-sm text-green-700 mt-2">
                Alle 5 Screening-Fragen mit &quot;Nein&quot; beantwortet - keine CMD-Symptome.
              </p>
            )}

            {/* Pending confirmations warning */}
            {pendingConfirmations > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {pendingConfirmations}{" "}
                  {pendingConfirmations === 1 ? "Frage benötigt" : "Fragen benötigen"}{" "}
                  Seitenbestätigung
                </span>
              </div>
            )}
          </div>

          {/* Details toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground flex-shrink-0"
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
      </div>

      {/* Expandable details */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <CardContent className="border-t bg-muted/20 p-4">
            <SQAnswersTable answers={answers} />
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
