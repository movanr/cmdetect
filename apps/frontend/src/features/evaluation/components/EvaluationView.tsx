/**
 * EvaluationView — Main evaluation page component.
 *
 * Two-card layout:
 * - Card 1: "DC/TMD-Kriterien nachschlagen" — passive reference tool, no confirm action.
 * - Card 2: "Diagnose dokumentieren" — local state only, doctor toggles diagnoses independently.
 *
 * Evaluates all DC/TMD diagnoses against SQ + examination data.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ALL_DIAGNOSES,
  evaluateAllDiagnoses,
  REGIONS,
  type DiagnosisDefinition,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { FormValues } from "../../examination";
import type { PersistedDiagnosisResult, PractitionerDecision } from "../types";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { CriteriaChecklist } from "./CriteriaChecklist";
import { SummaryDiagrams } from "./SummaryDiagrams";

interface EvaluationViewProps {
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
  results: PersistedDiagnosisResult[];
  onUpdateDecision?: (params: {
    resultId: string;
    practitionerDecision: PractitionerDecision;
    note: string | null;
  }) => void;
  readOnly?: boolean;
  caseId?: string;
}

const DIAGRAM_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];
const DIAGRAM_REGIONS_ALL: readonly Region[] = ["temporalis", "masseter", "tmj", "nonMast"];
const EXTRA_REGIONS: readonly Region[] = ["otherMast", "nonMast"];

export function EvaluationView({
  sqAnswers,
  examinationData,
  readOnly,
  caseId,
}: EvaluationViewProps) {
  // ── Reference panel state (Card 1) ─────────────────────────────────
  const [refDiagnosisId, setRefDiagnosisId] = useState<string | null>(null);

  // ── Document panel state (Card 2) ──────────────────────────────────
  const [confirmSide, setConfirmSide] = useState<Side>("right");
  const [confirmRegion, setConfirmRegion] = useState<Region>("temporalis");
  const [confirmShowAllRegions, setConfirmShowAllRegions] = useState(false);
  // Local confirmed diagnoses: key = "diagnosisId:side:region"
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  // ── Memos ──────────────────────────────────────────────────────────

  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData]
  );

  const refDiagnosis = useMemo((): DiagnosisDefinition | null => {
    if (!refDiagnosisId) return ALL_DIAGNOSES[0] ?? null;
    return ALL_DIAGNOSES.find((d) => d.id === refDiagnosisId) ?? ALL_DIAGNOSES[0] ?? null;
  }, [refDiagnosisId]);

  const refRegion = useMemo(
    () => refDiagnosis?.examination.regions[0] ?? "temporalis",
    [refDiagnosis]
  );

  const refSide: Side = "right";

  const confirmApplicableDiagnoses = useMemo(
    () => ALL_DIAGNOSES.filter((d) => d.examination.regions.includes(confirmRegion)),
    [confirmRegion]
  );

  const requirementMetMap = useMemo(() => {
    const hasRequires = confirmApplicableDiagnoses.some((d) => d.requires);
    if (!hasRequires) return {} as Record<string, boolean>;
    const allResults = evaluateAllDiagnoses(ALL_DIAGNOSES, criteriaData);
    const map: Record<string, boolean> = {};
    for (const d of confirmApplicableDiagnoses) {
      if (!d.requires) continue;
      map[d.id] = d.requires.anyOf.some((reqId) =>
        allResults.some((r) => r.diagnosisId === reqId && r.isPositive)
      );
    }
    return map;
  }, [confirmApplicableDiagnoses, criteriaData]);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleRegionClick = useCallback((side: Side, region: Region) => {
    setConfirmSide(side);
    setConfirmRegion(region);
  }, []);

  function handleToggle(diagnosisId: string) {
    if (readOnly) return;
    const key = `${diagnosisId}:${confirmSide}:${confirmRegion}`;
    setConfirmed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isChecked(diagnosisId: string) {
    return confirmed[`${diagnosisId}:${confirmSide}:${confirmRegion}`] === true;
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {caseId && (
        <div className="flex justify-end">
          <Button asChild>
            <Link to="/cases/$id/documentation" params={{ id: caseId }}>
              Weiter zur Dokumentation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* Card 1: Reference tool */}
      <Card>
        <CardHeader>
          <CardTitle>DC/TMD-Kriterien nachschlagen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={refDiagnosis?.id} onValueChange={setRefDiagnosisId}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Diagnose wählen…" />
            </SelectTrigger>
            <SelectContent>
              {ALL_DIAGNOSES.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.nameDE}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {refDiagnosis ? (
            <div className="max-w-xl">
              <CriteriaChecklist
                diagnosis={refDiagnosis}
                criteriaData={criteriaData}
                side={refSide}
                region={refRegion}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Card 2: Documentation — purely local state */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diagnose dokumentieren</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              id="confirm-all-regions"
              checked={confirmShowAllRegions}
              onCheckedChange={(checked) => {
                setConfirmShowAllRegions(checked === true);
                if (!checked && EXTRA_REGIONS.includes(confirmRegion)) {
                  setConfirmRegion("temporalis");
                }
              }}
            />
            <label
              htmlFor="confirm-all-regions"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Alle Regionen (U10)
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <SummaryDiagrams
              regions={confirmShowAllRegions ? DIAGRAM_REGIONS_ALL : DIAGRAM_REGIONS}
              selectedSide={confirmSide}
              selectedRegion={confirmRegion === "otherMast" ? null : confirmRegion}
              onRegionClick={handleRegionClick}
            />
            <div className="flex flex-col items-center gap-2">
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={confirmRegion}
                onValueChange={(v) => {
                  if (v) setConfirmRegion(v as Region);
                }}
              >
                <ToggleGroupItem value="temporalis">Temporalis</ToggleGroupItem>
                <ToggleGroupItem value="masseter">Masseter</ToggleGroupItem>
                <ToggleGroupItem value="tmj">{REGIONS.tmj}</ToggleGroupItem>
                {confirmShowAllRegions && (
                  <>
                    <ToggleGroupItem value="otherMast">{REGIONS.otherMast}</ToggleGroupItem>
                    <ToggleGroupItem value="nonMast">{REGIONS.nonMast}</ToggleGroupItem>
                  </>
                )}
              </ToggleGroup>

              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={confirmSide}
                onValueChange={(v) => {
                  if (v) setConfirmSide(v as Side);
                }}
              >
                <ToggleGroupItem value="right">Rechts</ToggleGroupItem>
                <ToggleGroupItem value="left">Links</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {confirmApplicableDiagnoses.length > 0 ? (
            <div className="space-y-1 max-w-xl mx-auto">
              {confirmApplicableDiagnoses.map((d) => {
                const checked = isChecked(d.id);
                const reqMet = requirementMetMap[d.id];
                return (
                  <div key={d.id}>
                    <div
                      className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleToggle(d.id)}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={readOnly}
                        onCheckedChange={() => handleToggle(d.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0"
                      />
                      <span className="text-sm font-medium flex-1">{d.nameDE}</span>
                      {reqMet === false && (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                    </div>
                    {reqMet === false && (
                      <p className="text-xs text-amber-700 ml-10 mb-1">
                        Voraussetzung: Myalgie oder Arthralgie muss ebenfalls positiv sein.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Keine Diagnosen für die gewählte Region verfügbar.
            </p>
          )}
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
