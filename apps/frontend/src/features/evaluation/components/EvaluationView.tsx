/**
 * EvaluationView — Main evaluation page component.
 *
 * Single card "Diagnose dokumentieren":
 * - Top: localisation selection + "In Befundbericht übernehmen" checklist
 * - Bottom: DC/TMD criteria lookup driven by localisation selection
 *
 * Evaluates all DC/TMD diagnoses against SQ + examination data.
 * Persists documented diagnoses to documented_diagnosis table.
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
  E10_SITE_KEYS,
  evaluateAllDiagnoses,
  PALPATION_SITES,
  REGIONS,
  SITE_CONFIG,
  type DiagnosisDefinition,
  type DiagnosisId,
  type PalpationSite,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, ListChecks, Network } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  createArthalgiaTree,
  createDdWithReductionTree,
  createDjdTree,
  createHeadacheTree,
  createMyalgiaSubtypesTree,
  createMyalgiaTree,
  createSubluxationTree,
  DecisionTreeView,
  type DecisionTreeDef,
} from "../../decision-tree";
import type { FormValues } from "../../examination";
import { useDocumentedDiagnoses } from "../hooks/use-diagnosis-evaluation";
import {
  useDocumentDiagnosis,
  useUndocumentDiagnosis,
} from "../hooks/use-save-diagnosis-evaluation";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { CriteriaChecklist } from "./CriteriaChecklist";
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

const MYALGIA_IDS: readonly DiagnosisId[] = [
  "myalgia",
  "localMyalgia",
  "myofascialPainWithSpreading",
  "myofascialPainWithReferral",
];

const DIAGRAM_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];
const DIAGRAM_REGIONS_ALL: readonly Region[] = ["temporalis", "masseter", "tmj", "nonMast"];
const EXTRA_REGIONS: readonly Region[] = ["otherMast", "nonMast"];

function getTreeForDiagnosis(
  diagnosis: DiagnosisDefinition,
  side: Side,
  region: Region
): DecisionTreeDef | null {
  switch (diagnosis.id) {
    case "myalgia":
      return createMyalgiaTree(side, region);
    case "localMyalgia":
    case "myofascialPainWithSpreading":
    case "myofascialPainWithReferral":
      return createMyalgiaSubtypesTree(side, region);
    case "arthralgia":
      return createArthalgiaTree(side);
    case "headacheAttributedToTmd":
      return createHeadacheTree(side);
    case "discDisplacementWithReduction":
    case "discDisplacementWithReductionIntermittentLocking":
    case "discDisplacementWithoutReductionLimitedOpening":
    case "discDisplacementWithoutReductionWithoutLimitedOpening":
      return createDdWithReductionTree(side);
    case "degenerativeJointDisease":
      return createDjdTree(side);
    case "subluxation":
      return createSubluxationTree(side);
    default:
      return null;
  }
}

/** Build a location key matching the format used for documented diagnosis lookups. */
function locationKey(side: Side, site: PalpationSite | null, region: Region): string {
  return `${side}:${site ?? region}`;
}

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
  // ── Reference panel state ─────────────────────────────────────────
  const [refDiagnosisId, setRefDiagnosisId] = useState<string | null>(null);
  const [refView, setRefView] = useState<"checklist" | "tree">("checklist");

  // ── Localisation derived from URL search params ───────────────────
  const confirmSide = selectedSide;
  const confirmRegion = selectedRegion;
  const confirmSite = selectedSite ?? null;
  const confirmShowAllRegions = showAllRegionsProp ?? false;
  const hasLocalisation = confirmSide !== undefined && confirmRegion !== undefined;

  // ── Backend persistence ─────────────────────────────────────────────
  const { data: documentedDiagnoses } = useDocumentedDiagnoses(patientRecordId);
  const documentMutation = useDocumentDiagnosis(patientRecordId);
  const undocumentMutation = useUndocumentDiagnosis(patientRecordId);

  // ── Derived state from documented diagnoses ─────────────────────────
  const documentedMap = useMemo(() => {
    const map = new Map<string, string>(); // locationKey → row id
    for (const d of documentedDiagnoses ?? []) {
      const key = `${d.diagnosisId}:${locationKey(d.side, d.site, d.region)}`;
      map.set(key, d.id);
    }
    return map;
  }, [documentedDiagnoses]);

  const documentedMyalgiaMap = useMemo(() => {
    const map = new Map<string, { diagnosisId: DiagnosisId; rowId: string }>(); // "side:site-or-region" → { diagnosisId, rowId }
    for (const d of documentedDiagnoses ?? []) {
      if ((MYALGIA_IDS as readonly string[]).includes(d.diagnosisId)) {
        const locKey = locationKey(d.side, d.site, d.region);
        map.set(locKey, { diagnosisId: d.diagnosisId, rowId: d.id });
      }
    }
    return map;
  }, [documentedDiagnoses]);

  // ── Memos ──────────────────────────────────────────────────────────

  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData]
  );

  const activeRegion: Region | undefined = confirmSite
    ? SITE_CONFIG[confirmSite].region
    : confirmRegion;

  const confirmApplicableDiagnoses = useMemo(
    () =>
      activeRegion ? ALL_DIAGNOSES.filter((d) => d.examination.regions.includes(activeRegion)) : [],
    [activeRegion],
  );

  const refDiagnosis = useMemo((): DiagnosisDefinition | null => {
    if (refDiagnosisId && confirmApplicableDiagnoses.some((d) => d.id === refDiagnosisId)) {
      return ALL_DIAGNOSES.find((d) => d.id === refDiagnosisId) ?? null;
    }
    return confirmApplicableDiagnoses[0] ?? null;
  }, [refDiagnosisId, confirmApplicableDiagnoses]);

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

  const handleRegionClick = useCallback(
    (side: Side, region: Region) => {
      onLocalisationChange({ side, region, site: undefined });
    },
    [onLocalisationChange],
  );

  // These helpers are only invoked inside the hasLocalisation-gated block,
  // so confirmSide / activeRegion are guaranteed to be defined at call time.
  const currentLocKey = hasLocalisation
    ? locationKey(confirmSide!, confirmSite, confirmRegion!)
    : "";

  function isChecked(diagnosisId: string) {
    return documentedMap.has(`${diagnosisId}:${currentLocKey}`);
  }

  function selectedMyalgiaId() {
    return documentedMyalgiaMap.get(currentLocKey)?.diagnosisId ?? "";
  }

  function handleToggle(diagnosisId: string) {
    if (readOnly) return;
    const key = `${diagnosisId}:${currentLocKey}`;
    const existingRowId = documentedMap.get(key);

    if (existingRowId) {
      undocumentMutation.mutate(existingRowId);
    } else {
      documentMutation.mutate({
        patientRecordId,
        diagnosisId: diagnosisId as DiagnosisId,
        side: confirmSide!,
        region: activeRegion!,
        site: confirmSite,
        userId,
      });
    }
  }

  function handleMyalgiaSelect(diagnosisId: string) {
    if (readOnly) return;
    const existing = documentedMyalgiaMap.get(currentLocKey);

    if (existing) {
      undocumentMutation.mutate(existing.rowId);
      if (existing.diagnosisId !== diagnosisId) {
        documentMutation.mutate({
          patientRecordId,
          diagnosisId: diagnosisId as DiagnosisId,
          side: confirmSide!,
          region: activeRegion!,
          site: confirmSite,
          userId,
        });
      }
    } else {
      documentMutation.mutate({
        patientRecordId,
        diagnosisId: diagnosisId as DiagnosisId,
        side: confirmSide!,
        region: activeRegion!,
        site: confirmSite,
        userId,
      });
    }
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Single card: Documentation + Criteria lookup */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnose dokumentieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Localisation selection — full-width parent context */}
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

          {/* Dependent sections — only visible when both side + region are selected */}
          {hasLocalisation && <div className="border-l-2 border-primary/15 pl-5 space-y-6">
            {/* "In Befundbericht übernehmen" checklist */}
            {confirmApplicableDiagnoses.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  In Befundbericht übernehmen
                </p>
                <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-1">

                {/* Myalgia group — radio buttons, only one selectable */}
                {(() => {
                  const myalgiaDiagnoses = confirmApplicableDiagnoses.filter((d) =>
                    (MYALGIA_IDS as readonly string[]).includes(d.id)
                  );
                  if (myalgiaDiagnoses.length === 0) return null;
                  const currentMyalgia = selectedMyalgiaId();
                  const sideLabel = confirmSide === "right" ? "rechte Seite" : "linke Seite";
                  return (
                    <div className="gap-0">
                      {myalgiaDiagnoses.map((d) => {
                        const localisationLabel = `${confirmSite ? PALPATION_SITES[confirmSite] : REGIONS[activeRegion!]}, ${sideLabel}`;
                        return (
                          <div
                            key={d.id}
                            className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50 cursor-pointer"
                            onClick={() => !readOnly && handleMyalgiaSelect(d.id)}
                          >
                            <Checkbox
                              checked={currentMyalgia === d.id}
                              disabled={readOnly}
                              onCheckedChange={() => handleMyalgiaSelect(d.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0"
                            />
                            <span className="text-sm font-medium flex-1">
                              {d.nameDE}{" "}
                              <span className="font-normal text-muted-foreground">
                                ({localisationLabel})
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Remaining diagnoses — checkboxes */}
                {confirmApplicableDiagnoses
                  .filter((d) => !(MYALGIA_IDS as readonly string[]).includes(d.id))
                  .map((d) => {
                    const checked = isChecked(d.id);
                    const reqMet = requirementMetMap[d.id];
                    const sideLabel = confirmSide === "right" ? "rechte Seite" : "linke Seite";
                    const localisationLabel = `${confirmSite ? PALPATION_SITES[confirmSite] : REGIONS[activeRegion!]}, ${sideLabel}`;
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
                          <span className="text-sm font-medium flex-1">
                            {d.nameDE}{" "}
                            <span className="font-normal text-muted-foreground">
                              ({localisationLabel})
                            </span>
                          </span>
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
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Keine Diagnosen für die gewählte Region verfügbar.
              </p>
            )}

            {/* Criteria lookup section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">
                  DC/TMD-Kriterien prüfen
                </p>
                <ToggleGroup
                  type="single"
                  value={refView}
                  onValueChange={(v) => {
                    if (v) setRefView(v as "checklist" | "tree");
                  }}
                  variant="outline"
                  size="sm"
                >
                  <ToggleGroupItem value="checklist" aria-label="Checkliste">
                    <ListChecks className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="tree" aria-label="Entscheidungsbaum">
                    <Network className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {refDiagnosis && refView === "checklist" && (
                <CriteriaChecklist
                  diagnosis={refDiagnosis}
                  criteriaData={criteriaData}
                  side={confirmSide!}
                  region={activeRegion!}
                  site={confirmSite ?? undefined}
                  titleSlot={
                    <Select value={refDiagnosis.id} onValueChange={setRefDiagnosisId}>
                      <SelectTrigger className="w-56 h-7 text-sm font-semibold bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {confirmApplicableDiagnoses.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.nameDE}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  }
                />
              )}

              {refDiagnosis &&
                refView === "tree" &&
                (() => {
                  const tree = getTreeForDiagnosis(refDiagnosis, confirmSide!, activeRegion!);
                  return tree ? (
                    <div className="overflow-x-auto">
                      <DecisionTreeView tree={tree} data={criteriaData} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Kein Entscheidungsbaum für diese Diagnose verfügbar.
                    </p>
                  );
                })()}
            </div>
          </div>}
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
