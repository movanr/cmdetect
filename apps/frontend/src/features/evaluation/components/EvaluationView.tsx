/**
 * EvaluationView — Main evaluation page component.
 *
 * Shows a static reference list of all DC/TMD diagnoses with expandable
 * criteria checklists, plus a findings summary.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import type { FormValues } from "../../examination";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { DiagnosisReference } from "./DiagnosisReference";
import { FindingsSummary } from "./FindingsSummary";

interface EvaluationViewProps {
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
  caseId?: string;
}

export function EvaluationView({ sqAnswers, examinationData, caseId }: EvaluationViewProps) {
  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData],
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnosekriterien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DiagnosisReference criteriaData={criteriaData} />
          <FindingsSummary criteriaData={criteriaData} />
        </CardContent>
      </Card>

      {caseId && (
        <div className="flex justify-end pt-2">
          <Button asChild>
            <Link to="/cases/$id/documentation" params={{ id: caseId }}>
              Weiter zur Dokumentation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
