/**
 * EvaluationView — Main evaluation page component.
 *
 * Single card "Diagnose dokumentieren":
 * - Top: localisation selection + "In Befundbericht übernehmen" checklist
 * - Bottom: DC/TMD criteria lookup driven by localisation selection
 *
 * Evaluates all DC/TMD diagnoses against SQ + examination data.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const MYALGIA_IDS = [
  "myalgia",
  "localMyalgia",
  "myofascialPainWithSpreading",
  "myofascialPainWithReferral",
] as const;

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
      return createDdWithReductionTree(side);
    case "degenerativeJointDisease":
      return createDjdTree(side);
    case "subluxation":
      return createSubluxationTree(side);
    default:
      return null;
  }
}

export function EvaluationView({
  sqAnswers,
  examinationData,
  readOnly,
  caseId,
}: EvaluationViewProps) {
  // ── Reference panel state (Card 1) ─────────────────────────────────
  const [refDiagnosisId, setRefDiagnosisId] = useState<string | null>(null);
  const [refView, setRefView] = useState<"checklist" | "tree">("checklist");

  // ── Document panel state (Card 2) ──────────────────────────────────
  const [confirmSide, setConfirmSide] = useState<Side>("right");
  const [confirmRegion, setConfirmRegion] = useState<Region>("temporalis");
  const [confirmSite, setConfirmSite] = useState<PalpationSite | null>(null);
  const [confirmShowAllRegions, setConfirmShowAllRegions] = useState(false);
  // Local confirmed diagnoses: key = "diagnosisId:side:site-or-region"
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  // Selected myalgia type (radio): key = "side:site-or-region" → diagnosisId or ""
  const [selectedMyalgia, setSelectedMyalgia] = useState<Record<string, string>>({});

  // ── Memos ──────────────────────────────────────────────────────────

  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData]
  );

  const activeRegion: Region = confirmSite ? SITE_CONFIG[confirmSite].region : confirmRegion;

  const confirmApplicableDiagnoses = useMemo(
    () => ALL_DIAGNOSES.filter((d) => d.examination.regions.includes(activeRegion)),
    [activeRegion]
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

  const handleRegionClick = useCallback((side: Side, region: Region) => {
    setConfirmSide(side);
    setConfirmRegion(region);
    setConfirmSite(null);
  }, []);

  function locationKey() {
    return `${confirmSide}:${confirmSite ?? confirmRegion}`;
  }

  function handleToggle(diagnosisId: string) {
    if (readOnly) return;
    const key = `${diagnosisId}:${locationKey()}`;
    setConfirmed((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isChecked(diagnosisId: string) {
    return confirmed[`${diagnosisId}:${locationKey()}`] === true;
  }

  function selectedMyalgiaId() {
    return selectedMyalgia[locationKey()] ?? "";
  }

  function handleMyalgiaSelect(diagnosisId: string) {
    if (readOnly) return;
    const loc = locationKey();
    setSelectedMyalgia((prev) => ({
      ...prev,
      [loc]: prev[loc] === diagnosisId ? "" : diagnosisId,
    }));
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

      {/* Single card: Documentation + Criteria lookup */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnose dokumentieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6 items-start">
            {/* Left: localisation selection */}
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 flex gap-6">
              <div className="flex flex-col gap-2">
                <SummaryDiagrams
                  regions={confirmShowAllRegions ? DIAGRAM_REGIONS_ALL : DIAGRAM_REGIONS}
                  selectedSide={confirmSide}
                  selectedRegion={activeRegion === "otherMast" ? null : activeRegion}
                  onRegionClick={handleRegionClick}
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="confirm-all-regions"
                    checked={confirmShowAllRegions}
                    onCheckedChange={(checked) => {
                      setConfirmShowAllRegions(checked === true);
                      if (!checked) {
                        if (EXTRA_REGIONS.includes(confirmRegion)) setConfirmRegion("temporalis");
                        setConfirmSite(null);
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
              <div className="flex gap-8">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Lokalisation
                  </p>
                  <RadioGroup
                    value={confirmSite ?? confirmRegion}
                    onValueChange={(v) => {
                      if ((E10_SITE_KEYS as readonly string[]).includes(v)) {
                        const site = v as PalpationSite;
                        setConfirmSite(site);
                        setConfirmRegion(SITE_CONFIG[site].region);
                      } else {
                        setConfirmSite(null);
                        setConfirmRegion(v as Region);
                      }
                    }}
                  >
                    {(["temporalis", "masseter", "tmj"] as const).map((r) => (
                      <div key={r} className="flex items-center gap-2">
                        <RadioGroupItem value={r} id={`loc-${r}`} />
                        <label htmlFor={`loc-${r}`} className="text-sm cursor-pointer">
                          {REGIONS[r]}
                        </label>
                      </div>
                    ))}
                    {confirmShowAllRegions &&
                      E10_SITE_KEYS.map((site) => (
                        <div key={site} className="flex items-center gap-2">
                          <RadioGroupItem value={site} id={`loc-${site}`} />
                          <label htmlFor={`loc-${site}`} className="text-sm cursor-pointer">
                            {PALPATION_SITES[site]}
                          </label>
                        </div>
                      ))}
                  </RadioGroup>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Seite
                  </p>
                  <RadioGroup value={confirmSide} onValueChange={(v) => setConfirmSide(v as Side)}>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="right" id="side-right" />
                      <label htmlFor="side-right" className="text-sm cursor-pointer">
                        Rechte Seite
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="left" id="side-left" />
                      <label htmlFor="side-left" className="text-sm cursor-pointer">
                        Linke Seite
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* Right: "In Befundbericht übernehmen" checklist */}
            {confirmApplicableDiagnoses.length > 0 ? (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 pb-1">
                  In Befundbericht übernehmen
                </p>

                {/* Myalgia group — radio buttons, only one selectable */}
                {(() => {
                  const myalgiaDiagnoses = confirmApplicableDiagnoses.filter((d) =>
                    (MYALGIA_IDS as readonly string[]).includes(d.id)
                  );
                  if (myalgiaDiagnoses.length === 0) return null;
                  const currentMyalgia = selectedMyalgiaId();
                  const sideLabel = confirmSide === "right" ? "rechte Seite" : "linke Seite";
                  return (
                    <RadioGroup
                      value={currentMyalgia}
                      onValueChange={(v) => !readOnly && handleMyalgiaSelect(v)}
                      className="gap-0"
                    >
                      {myalgiaDiagnoses.map((d) => {
                        const localisationLabel = `${confirmSite ? PALPATION_SITES[confirmSite] : REGIONS[activeRegion]}, ${sideLabel}`;
                        return (
                          <div
                            key={d.id}
                            className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleMyalgiaSelect(d.id)}
                          >
                            <RadioGroupItem
                              value={d.id}
                              id={`myalgia-${d.id}`}
                              disabled={readOnly}
                              className="shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label
                              htmlFor={`myalgia-${d.id}`}
                              className="text-sm font-medium flex-1 cursor-pointer"
                            >
                              {d.nameDE}{" "}
                              <span className="font-normal text-muted-foreground">
                                ({localisationLabel})
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  );
                })()}

                {/* Remaining diagnoses — checkboxes */}
                {confirmApplicableDiagnoses
                  .filter((d) => !(MYALGIA_IDS as readonly string[]).includes(d.id))
                  .map((d) => {
                    const checked = isChecked(d.id);
                    const reqMet = requirementMetMap[d.id];
                    const sideLabel = confirmSide === "right" ? "rechte Seite" : "linke Seite";
                    const localisationLabel = `${confirmSite ? PALPATION_SITES[confirmSite] : REGIONS[activeRegion]}, ${sideLabel}`;
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
            ) : (
              <p className="text-sm text-muted-foreground self-center text-center">
                Keine Diagnosen für die gewählte Region verfügbar.
              </p>
            )}
          </div>

          {/* Divider */}
          <hr className="border-border" />

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
                side={confirmSide}
                region={activeRegion}
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
                const tree = getTreeForDiagnosis(refDiagnosis, confirmSide, activeRegion);
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
