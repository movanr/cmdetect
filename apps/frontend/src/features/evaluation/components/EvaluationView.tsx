/**
 * EvaluationView — Main evaluation page component.
 *
 * Single-card layout with region × side toggles, head diagrams as an
 * alternative selector, diagnosis sidebar, and decision tree or checklist.
 *
 * Evaluates all DC/TMD diagnoses against SQ + examination data.
 * Myalgia subtypes are flattened: if a subtype is positive it replaces
 * the parent myalgia diagnosis.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { ArrowRight, GitBranch, Info, ListChecks } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  DecisionTreeView,
  createArthalgiaTree,
  createDdWithReductionTree,
  createDjdTree,
  createHeadacheTree,
  createMyalgiaSubtypesTree,
  createMyalgiaTree,
  createSubluxationTree,
} from "../../decision-tree";
import type { FormValues } from "../../examination";
import type { PersistedDiagnosisResult, PractitionerDecision } from "../types";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { CriteriaChecklist } from "./CriteriaChecklist";
import { SummaryDiagrams } from "./SummaryDiagrams";

interface EvaluationViewProps {
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
  /** Persisted diagnosis results from backend */
  results: PersistedDiagnosisResult[];
  /** Callback to update a practitioner decision */
  onUpdateDecision?: (params: {
    resultId: string;
    practitionerDecision: PractitionerDecision;
    note: string | null;
  }) => void;
  /** Whether the current user can only view (receptionist) */
  readOnly?: boolean;
  /** Case ID for navigation to report page */
  caseId?: string;
}

/** Regions shown in the head diagrams (base 3) */
const DIAGRAM_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];

/** Regions shown in the head diagrams when "Alle Regionen" is active (includes nonMast which has an SVG path) */
const DIAGRAM_REGIONS_ALL: readonly Region[] = ["temporalis", "masseter", "tmj", "nonMast"];

/** Extra regions only visible when "Alle Regionen" is active */
const EXTRA_REGIONS: readonly Region[] = ["otherMast", "nonMast"];

// ── View mode ──────────────────────────────────────────────────────
type ViewMode = "tree" | "checklist";

// ── Tree types — each entry maps 1:1 to a decision tree ────────────
type TreeTypeId =
  | "myalgia"
  | "myalgiaSubtypes"
  | "arthralgia"
  | "headache"
  | "ddWithReduction"
  | "degenerativeJointDisease"
  | "subluxation";

interface TreeTypeEntry {
  id: TreeTypeId;
  label: string;
  regions: readonly Region[];
}

const TREE_TYPES: readonly TreeTypeEntry[] = [
  { id: "myalgia", label: "Myalgie", regions: ["temporalis", "masseter", "otherMast", "nonMast"] },
  { id: "myalgiaSubtypes", label: "Myalgie-Subtypen", regions: ["temporalis", "masseter", "otherMast", "nonMast"] },
  { id: "arthralgia", label: "Arthralgie", regions: ["tmj"] },
  { id: "headache", label: "Auf CMD zurückgeführte Kopfschmerzen", regions: ["temporalis"] },
  { id: "ddWithReduction", label: "Diskusverlagerung", regions: ["tmj"] },
  { id: "degenerativeJointDisease", label: "Degenerative Gelenkerkrankung", regions: ["tmj"] },
  { id: "subluxation", label: "Subluxation", regions: ["tmj"] },
];

function StepLabel({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-2 self-start">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
        {step}
      </span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export function EvaluationView({
  sqAnswers,
  examinationData,
  results,
  onUpdateDecision,
  readOnly,
  caseId,
}: EvaluationViewProps) {
  // ── State ──────────────────────────────────────────────────────────
  const [selectedSide, setSelectedSide] = useState<Side>("right");
  const [selectedRegion, setSelectedRegion] = useState<Region>("temporalis");
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [userSelectedTree, setUserSelectedTree] = useState<TreeTypeId | null>(null);
  const [userSelectedDiagnosisId, setUserSelectedDiagnosisId] = useState<string | null>(null);

  // ── Memos (dependency order) ───────────────────────────────────────

  // 1. Criteria data from raw inputs
  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData]
  );

  // 2. Tree types applicable to the selected region
  const currentTreeTypes = useMemo(
    () => TREE_TYPES.filter((t) => t.regions.includes(selectedRegion)),
    [selectedRegion]
  );

  // 3. Diagnoses applicable to the selected region (for checklist mode)
  const currentDiagnoses = useMemo(
    () => ALL_DIAGNOSES.filter((d) => d.examination.regions.includes(selectedRegion)),
    [selectedRegion]
  );

  // 4. Selected diagnosis for checklist mode (auto-select first if invalid)
  const selectedDiagnosis = useMemo((): DiagnosisDefinition | null => {
    if (currentDiagnoses.length === 0) return null;
    const match = currentDiagnoses.find((d) => d.id === userSelectedDiagnosisId);
    return match ?? currentDiagnoses[0];
  }, [currentDiagnoses, userSelectedDiagnosisId]);

  // 5. Cross-diagnosis requirement check (for headache's requires constraint)
  const requirementMet = useMemo(() => {
    if (!selectedDiagnosis?.requires) return undefined;
    const allResults = evaluateAllDiagnoses(ALL_DIAGNOSES, criteriaData);
    return selectedDiagnosis.requires.anyOf.some((reqId) =>
      allResults.some((r) => r.diagnosisId === reqId && r.isPositive)
    );
  }, [selectedDiagnosis, criteriaData]);

  // 7. Derive effective selectedTree — auto-select first if user pick is invalid
  const selectedTree = useMemo((): TreeTypeId | null => {
    if (currentTreeTypes.length === 0) return null;
    const isInList = currentTreeTypes.some((t) => t.id === userSelectedTree);
    return isInList ? userSelectedTree : currentTreeTypes[0].id;
  }, [currentTreeTypes, userSelectedTree]);

  // 8. Decision tree data for selected tree type
  const treeData = useMemo(() => {
    if (!selectedTree) return null;
    switch (selectedTree) {
      case "myalgia":
        return createMyalgiaTree(selectedSide, selectedRegion);
      case "myalgiaSubtypes":
        return createMyalgiaSubtypesTree(selectedSide, selectedRegion);
      case "arthralgia":
        return createArthalgiaTree(selectedSide);
      case "headache":
        return createHeadacheTree(selectedSide);
      case "ddWithReduction":
        return createDdWithReductionTree(selectedSide);
      case "degenerativeJointDisease":
        return createDjdTree(selectedSide);
      case "subluxation":
        return createSubluxationTree(selectedSide);
      default:
        return null;
    }
  }, [selectedTree, selectedSide, selectedRegion]);

  // 9. End node decisions for the current tree's (side, region)
  const endNodeDecisions = useMemo(() => {
    const map: Record<string, PractitionerDecision> = {};
    for (const r of results) {
      if (r.side === selectedSide && r.region === selectedRegion) {
        map[r.diagnosisId] = r.practitionerDecision;
      }
    }
    return map;
  }, [results, selectedSide, selectedRegion]);

  // ── Handlers ───────────────────────────────────────────────────────

  const handleRegionClick = useCallback((side: Side, region: Region) => {
    setSelectedSide(side);
    setSelectedRegion(region);
  }, []);

  const handleEndNodeConfirm = useCallback(
    (diagnosisId: string, note: string | null) => {
      if (!onUpdateDecision) return;

      const persisted = results.find(
        (r) =>
          r.diagnosisId === diagnosisId && r.side === selectedSide && r.region === selectedRegion
      );
      if (!persisted) return;

      const isCurrentlyConfirmed = persisted.practitionerDecision === "confirmed";

      onUpdateDecision({
        resultId: persisted.id,
        practitionerDecision: isCurrentlyConfirmed ? null : "confirmed",
        note,
      });
    },
    [results, onUpdateDecision, selectedSide, selectedRegion]
  );

  const handleTreeSelect = useCallback((id: string) => {
    setUserSelectedTree(id as TreeTypeId);
  }, []);

  const handleDiagnosisSelect = useCallback((id: string) => {
    setUserSelectedDiagnosisId(id);
  }, []);

  const handleViewModeChange = useCallback((value: string) => {
    if (value) setViewMode(value as ViewMode);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Navigation to next step */}
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

      {/* Decision tree / checklist explorer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>DC/TMD-Kriterien abgleichen</CardTitle>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-all-regions"
              checked={showAllRegions}
              onCheckedChange={(checked) => {
                setShowAllRegions(checked === true);
                if (!checked && EXTRA_REGIONS.includes(selectedRegion)) {
                  setSelectedRegion("temporalis");
                }
              }}
            />
            <label
              htmlFor="show-all-regions"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Alle Regionen (U10)
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Location */}
          <div className="flex flex-col items-center gap-3">
            <StepLabel step={1} label="Lokalisation wählen" />
            <SummaryDiagrams
              regions={showAllRegions ? DIAGRAM_REGIONS_ALL : DIAGRAM_REGIONS}
              selectedSide={selectedSide}
              selectedRegion={selectedRegion === "otherMast" ? null : selectedRegion}
              onRegionClick={handleRegionClick}
            />
            <div className="flex flex-col items-center gap-2">
              <ToggleGroup
                type="single"
                variant="outline"
                size="sm"
                value={selectedRegion}
                onValueChange={(v) => {
                  if (v) setSelectedRegion(v as Region);
                }}
              >
                <ToggleGroupItem value="temporalis">Temporalis</ToggleGroupItem>
                <ToggleGroupItem value="masseter">Masseter</ToggleGroupItem>
                <ToggleGroupItem value="tmj">{REGIONS.tmj}</ToggleGroupItem>
                {showAllRegions && (
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
                value={selectedSide}
                onValueChange={(v) => {
                  if (v) setSelectedSide(v as Side);
                }}
              >
                <ToggleGroupItem value="right">Rechts</ToggleGroupItem>
                <ToggleGroupItem value="left">Links</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* View mode toggle */}
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={viewMode}
              onValueChange={handleViewModeChange}
            >
              <ToggleGroupItem value="tree" className="gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                Entscheidungsbaum
              </ToggleGroupItem>
              <ToggleGroupItem value="checklist" className="gap-1.5">
                <ListChecks className="h-3.5 w-3.5" />
                Checkliste
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Step 2: Selection (tree type or diagnosis) */}
          <div className="flex flex-col items-center gap-2">
            <StepLabel
              step={2}
              label={viewMode === "tree" ? "Entscheidungsbaum wählen" : "Diagnose wählen"}
            />
            {viewMode === "tree" ? (
              <Select value={selectedTree ?? undefined} onValueChange={handleTreeSelect}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Diagnose wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {currentTreeTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={selectedDiagnosis?.id ?? undefined}
                onValueChange={handleDiagnosisSelect}
              >
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Diagnose wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {currentDiagnoses.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nameDE}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Step 3: Decision tree or Checklist */}
          <div className="space-y-2">
            <StepLabel step={3} label="Diagnosekriterien auswerten" />

            {viewMode === "tree" ? (
              <>
                {treeData ? (
                  <ScrollArea className="w-full">
                    <div className="min-w-fit pb-4">
                      <DecisionTreeView
                        tree={treeData}
                        data={criteriaData}
                        onLinkedNodeClick={handleTreeSelect}
                        endNodeDecisions={endNodeDecisions}
                        onEndNodeConfirm={handleEndNodeConfirm}
                        readOnly={readOnly}
                      />
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Kein Entscheidungsbaum für die aktuelle Diagnose verfügbar.
                  </p>
                )}
                <Alert className="bg-blue-50/50 border-blue-200">
                  <Info className="text-blue-500" />
                  <AlertDescription className="text-blue-900">
                    Klicken Sie auf einen Endknoten, um eine Diagnose zu stellen oder
                    aufzuheben. Die Diagnoseentscheidung obliegt der behandelnden
                    Ärztin / dem behandelnden Arzt.
                  </AlertDescription>
                </Alert>
              </>
            ) : selectedDiagnosis ? (
              <div className="max-w-xl mx-auto">
                <CriteriaChecklist
                  diagnosis={selectedDiagnosis}
                  criteriaData={criteriaData}
                  side={selectedSide}
                  region={selectedRegion}
                  practitionerDecision={endNodeDecisions[selectedDiagnosis.id]}
                  onConfirm={handleEndNodeConfirm}
                  readOnly={readOnly}
                  requirementMet={requirementMet}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Keine Diagnose für die aktuelle Region verfügbar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation to next step */}
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
