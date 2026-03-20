/**
 * EvaluationView — Main evaluation page component.
 *
 * Thin orchestrator: localisation UI → DiagnosisList → navigation button.
 * All diagnosis rendering and criteria evaluation delegated to DiagnosisList.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ALL_DIAGNOSES,
  E10_SITE_KEYS,
  PALPATION_SITES,
  REGIONS,
  SITE_CONFIG,
  type DiagnosisId,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useCallback, useMemo } from "react";
import type { FormValues } from "../../examination";
import { useCriteriaAssessmentMap } from "../hooks/use-criteria-assessments";
import { useDocumentedDiagnoses } from "../hooks/use-diagnosis-evaluation";
import {
  useDeleteCriteriaAssessment,
  useUpsertCriteriaAssessment,
} from "../hooks/use-save-criteria-assessment";
import {
  useDocumentDiagnosis,
  useUndocumentDiagnosis,
} from "../hooks/use-save-diagnosis-evaluation";
import type { CriterionUserState } from "../types";
import type { ChecklistItem } from "../utils/extract-criteria-items";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { DiagnosisList } from "./DiagnosisList";
import { SummaryDiagrams } from "./SummaryDiagrams";

interface EvaluationViewProps {
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
  patientRecordId: string;
  userId: string;
  readOnly?: boolean;
  caseId?: string;
  selectedSide?: Side;
  selectedRegion?: Region;
  selectedSite?: PalpationSite;
  showAllRegions?: boolean;
  onLocalisationChange: (
    updates: Partial<{
      side: Side;
      region: Region;
      site: PalpationSite | undefined;
      showAllRegions: boolean;
    }>,
  ) => void;
}

const DIAGRAM_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];
const DIAGRAM_REGIONS_ALL: readonly Region[] = ["temporalis", "masseter", "tmj", "nonMast"];
const EXTRA_REGIONS: readonly Region[] = ["otherMast", "nonMast"];

export function EvaluationView({
  sqAnswers,
  examinationData,
  patientRecordId,
  userId,
  readOnly,
  caseId,
  selectedSide,
  selectedRegion,
  selectedSite,
  showAllRegions: showAllRegionsProp,
  onLocalisationChange,
}: EvaluationViewProps) {
  // ── Localisation derived from URL search params ───────────────────
  const confirmSide = selectedSide;
  const confirmRegion = selectedRegion;
  const confirmSite = selectedSite ?? null;
  const confirmShowAllRegions = showAllRegionsProp ?? false;
  const hasLocalisation = confirmSide !== undefined && confirmRegion !== undefined;

  const activeRegion: Region | undefined = confirmSite
    ? SITE_CONFIG[confirmSite].region
    : confirmRegion;

  // ── Backend persistence ─────────────────────────────────────────────
  const { data: documentedDiagnoses } = useDocumentedDiagnoses(patientRecordId);
  const documentMutation = useDocumentDiagnosis(patientRecordId);
  const undocumentMutation = useUndocumentDiagnosis(patientRecordId);
  const { data: criteriaAssessmentMap } = useCriteriaAssessmentMap(patientRecordId);
  const upsertAssessment = useUpsertCriteriaAssessment(patientRecordId);
  const deleteAssessment = useDeleteCriteriaAssessment(patientRecordId);

  // ── Memos ──────────────────────────────────────────────────────────
  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData],
  );

  const confirmApplicableDiagnoses = useMemo(
    () =>
      activeRegion ? ALL_DIAGNOSES.filter((d) => d.examination.regions.includes(activeRegion)) : [],
    [activeRegion],
  );

  // ── Handlers ───────────────────────────────────────────────────────

  const handleRegionClick = useCallback(
    (side: Side, region: Region) => {
      onLocalisationChange({ side, region, site: undefined });
    },
    [onLocalisationChange],
  );

  const handleDocument = useCallback(
    (params: {
      diagnosisId: DiagnosisId;
      side: Side;
      region: Region;
      site: PalpationSite | null;
    }) => {
      documentMutation.mutate({
        patientRecordId,
        diagnosisId: params.diagnosisId,
        side: params.side,
        region: params.region,
        site: params.site,
        userId,
      });
    },
    [documentMutation, patientRecordId, userId],
  );

  const handleUndocument = useCallback(
    (rowId: string) => {
      undocumentMutation.mutate(rowId);
    },
    [undocumentMutation],
  );

  const handleAssessmentChange = useCallback(
    (item: ChecklistItem, state: CriterionUserState) => {
      upsertAssessment.mutate({
        patientRecordId,
        criterionId: item.criterionId,
        side: item.assessmentSide,
        region: item.assessmentRegion,
        site: item.assessmentSite,
        state,
        userId,
      });
    },
    [upsertAssessment, patientRecordId, userId],
  );

  const handleAssessmentClear = useCallback(
    (item: ChecklistItem) => {
      const assessment = criteriaAssessmentMap.get(item.key);
      if (assessment) {
        deleteAssessment.mutate(assessment.id);
      }
    },
    [deleteAssessment, criteriaAssessmentMap],
  );

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnose dokumentieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Localisation selection */}
          <div className="space-y-4">
            <SummaryDiagrams
              regions={confirmShowAllRegions ? DIAGRAM_REGIONS_ALL : DIAGRAM_REGIONS}
              selectedSide={confirmSide}
              selectedRegion={
                activeRegion === "otherMast" || activeRegion === undefined ? null : activeRegion
              }
              onRegionClick={handleRegionClick}
            />

            <div className="flex flex-col gap-3">
              {/* Side tabs */}
              <ToggleGroup
                type="single"
                value={confirmSide ?? ""}
                onValueChange={(v) => {
                  if (v) onLocalisationChange({ side: v as Side });
                }}
                variant="outline"
                className="justify-start"
              >
                <ToggleGroupItem value="right" className="text-sm">
                  Rechte Seite
                </ToggleGroupItem>
                <ToggleGroupItem value="left" className="text-sm">
                  Linke Seite
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Region tabs */}
              <ToggleGroup
                type="single"
                value={confirmSite ?? confirmRegion ?? ""}
                onValueChange={(v) => {
                  if (!v) return;
                  if ((E10_SITE_KEYS as readonly string[]).includes(v)) {
                    const site = v as PalpationSite;
                    onLocalisationChange({ site, region: SITE_CONFIG[site].region });
                  } else {
                    onLocalisationChange({ region: v as Region, site: undefined });
                  }
                }}
                variant="outline"
                className="justify-start flex-wrap"
              >
                {(["temporalis", "masseter", "tmj"] as const).map((r) => (
                  <ToggleGroupItem key={r} value={r} className="text-sm">
                    {REGIONS[r]}
                  </ToggleGroupItem>
                ))}
                {confirmShowAllRegions &&
                  E10_SITE_KEYS.map((site) => (
                    <ToggleGroupItem key={site} value={site} className="text-sm">
                      {PALPATION_SITES[site]}
                    </ToggleGroupItem>
                  ))}
              </ToggleGroup>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm-all-regions"
                  checked={confirmShowAllRegions}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onLocalisationChange({ showAllRegions: true });
                    } else {
                      const resetRegion =
                        confirmRegion && EXTRA_REGIONS.includes(confirmRegion)
                          ? "temporalis"
                          : confirmRegion;
                      onLocalisationChange({
                        showAllRegions: false,
                        region: resetRegion as Region,
                        site: undefined,
                      });
                    }
                  }}
                />
                <label
                  htmlFor="confirm-all-regions"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  Ergänzende Palpationsgebiete anzeigen
                </label>
              </div>
            </div>
          </div>

          {/* Unified diagnosis list */}
          {hasLocalisation && (
            <DiagnosisList
              applicableDiagnoses={confirmApplicableDiagnoses}
              side={confirmSide!}
              region={activeRegion!}
              site={confirmSite}
              criteriaData={criteriaData}
              documentedDiagnoses={documentedDiagnoses ?? []}
              assessmentMap={criteriaAssessmentMap}
              onDocument={handleDocument}
              onUndocument={handleUndocument}
              onAssessmentChange={handleAssessmentChange}
              onAssessmentClear={handleAssessmentClear}
              readOnly={readOnly}
            />
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
