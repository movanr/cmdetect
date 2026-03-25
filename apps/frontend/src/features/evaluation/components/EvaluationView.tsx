/**
 * EvaluationView — Main evaluation page component.
 *
 * Top row: "Diagnose dokumentieren" card (selector + button) beside
 *          "Dokumentierte Diagnosen" card (persisted list).
 * Below:   Full-width reference list + findings summary.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ALL_DIAGNOSES, type DiagnosisId, type PalpationSite, type Region, type Side } from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { FormValues } from "../../examination";
import { useDocumentedDiagnoses } from "../hooks/use-diagnosis-evaluation";
import {
  useDocumentDiagnosis,
  useUndocumentDiagnosis,
} from "../hooks/use-save-diagnosis-evaluation";
import type { DocumentedDiagnosis } from "../types";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { DiagnosisReference } from "./DiagnosisReference";
import { DiagnosisSelector, type DiagnosisSelection } from "./DiagnosisSelector";
import { DocumentedDiagnosesList } from "./DocumentedDiagnosesList";
import { FindingsSummary } from "./FindingsSummary";

/** Myalgia base + subtypes are mutually exclusive at the same location. */
const MYALGIA_GROUP = new Set<DiagnosisId>([
  "myalgia",
  "localMyalgia",
  "myofascialPainWithSpreading",
  "myofascialPainWithReferral",
]);

function diagnosisLabel(id: DiagnosisId): string {
  return ALL_DIAGNOSES.find((d) => d.id === id)?.nameDE ?? id;
}

interface EvaluationViewProps {
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
  patientRecordId: string;
  userId: string;
  readOnly?: boolean;
  caseId?: string;
}

export function EvaluationView({
  sqAnswers,
  examinationData,
  patientRecordId,
  userId,
  readOnly,
  caseId,
}: EvaluationViewProps) {
  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData],
  );

  // ── Selector state ────────────────────────────────────────────────
  const [diagnosisId, setDiagnosisId] = useState<DiagnosisId | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [site, setSite] = useState<PalpationSite | null>(null);

  const handleSelectionChange = useCallback((updates: Partial<DiagnosisSelection>) => {
    if ("diagnosisId" in updates) {
      setDiagnosisId(updates.diagnosisId ?? null);
      setRegion(updates.region ?? null);
      setSite(null);
    }
    if ("side" in updates && updates.side) setSide(updates.side);
    if ("region" in updates) setRegion(updates.region ?? null);
    if ("site" in updates) setSite(updates.site ?? null);
  }, []);

  // ── Persistence ───────────────────────────────────────────────────
  const { data: documentedDiagnoses } = useDocumentedDiagnoses(patientRecordId);
  const documentMutation = useDocumentDiagnosis(patientRecordId);
  const undocumentMutation = useUndocumentDiagnosis(patientRecordId);

  const isAlreadyDocumented = useMemo(() => {
    if (!diagnosisId || !side || !region || !documentedDiagnoses) return false;
    return documentedDiagnoses.some(
      (d) =>
        d.diagnosisId === diagnosisId &&
        d.side === side &&
        d.region === region &&
        d.site === site,
    );
  }, [documentedDiagnoses, diagnosisId, side, region, site]);

  /** Find a conflicting myalgia-group diagnosis at the same location. */
  const myalgiaConflict = useMemo((): DocumentedDiagnosis | null => {
    if (!diagnosisId || !side || !region || !documentedDiagnoses) return null;
    if (!MYALGIA_GROUP.has(diagnosisId)) return null;
    return (
      documentedDiagnoses.find(
        (d) =>
          MYALGIA_GROUP.has(d.diagnosisId) &&
          d.diagnosisId !== diagnosisId &&
          d.side === side &&
          d.region === region &&
          d.site === site,
      ) ?? null
    );
  }, [documentedDiagnoses, diagnosisId, side, region, site]);

  const canDocument =
    diagnosisId !== null && side !== null && region !== null && !isAlreadyDocumented;

  // ── Conflict dialog state ─────────────────────────────────────────
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

  const handleDocumentClick = useCallback(() => {
    if (!canDocument) return;
    if (myalgiaConflict) {
      setConflictDialogOpen(true);
    } else {
      documentMutation.mutate({
        patientRecordId,
        diagnosisId: diagnosisId!,
        side: side!,
        region: region!,
        site,
        userId,
      });
    }
  }, [canDocument, myalgiaConflict, documentMutation, patientRecordId, diagnosisId, side, region, site, userId]);

  const handleConfirmReplace = useCallback(() => {
    if (!myalgiaConflict || !diagnosisId || !side || !region) return;
    undocumentMutation.mutate(myalgiaConflict.id);
    documentMutation.mutate({
      patientRecordId,
      diagnosisId,
      side,
      region,
      site,
      userId,
    });
    setConflictDialogOpen(false);
  }, [myalgiaConflict, undocumentMutation, documentMutation, patientRecordId, diagnosisId, side, region, site, userId]);

  const handleRemove = useCallback(
    (id: string) => {
      undocumentMutation.mutate(id);
    },
    [undocumentMutation],
  );

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Top row: selector + documented diagnoses side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {!readOnly && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnose dokumentieren</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <DiagnosisSelector
                  diagnosisId={diagnosisId}
                  side={side}
                  region={region}
                  site={site}
                  onChange={handleSelectionChange}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        onClick={handleDocumentClick}
                        disabled={!canDocument}
                        size="sm"
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Dokumentieren
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {isAlreadyDocumented && (
                    <TooltipContent>
                      Diese Diagnose ist bereits dokumentiert.
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle className="text-base">Dokumentierte Diagnosen</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentedDiagnosesList
              diagnoses={documentedDiagnoses ?? []}
              onRemove={handleRemove}
              readOnly={readOnly}
            />
          </CardContent>
        </Card>
      </div>

      {/* Full-width: reference list + findings */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnosekriterien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DiagnosisReference
            criteriaData={criteriaData}
            selectedDiagnosisId={diagnosisId}
            selectedSide={side}
            selectedRegion={region}
          />

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

      {/* Myalgia conflict confirmation dialog */}
      <AlertDialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Diagnose ersetzen?</AlertDialogTitle>
            <AlertDialogDescription>
              An dieser Lokalisation ist bereits{" "}
              <span className="font-semibold text-foreground">
                {myalgiaConflict ? diagnosisLabel(myalgiaConflict.diagnosisId) : ""}
              </span>{" "}
              dokumentiert. Myalgie-Diagnosen sind an derselben Lokalisation nicht gleichzeitig
              möglich.
              <br />
              <br />
              Soll die bestehende Diagnose durch{" "}
              <span className="font-semibold text-foreground">
                {diagnosisId ? diagnosisLabel(diagnosisId) : ""}
              </span>{" "}
              ersetzt werden?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReplace}>
              Ersetzen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
