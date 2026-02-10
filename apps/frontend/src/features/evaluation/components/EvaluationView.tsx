/**
 * EvaluationView — Main evaluation page component.
 *
 * Two-panel layout:
 * - Left: Combined head diagrams (clickable) + positive diagnoses grouped by location
 * - Right: Toggle controls, all diagnoses for selected region, decision tree
 *
 * Evaluates all DC/TMD diagnoses against SQ + examination data.
 * Myalgia subtypes are flattened: if a subtype is positive it replaces
 * the parent myalgia diagnosis.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ALL_DIAGNOSES,
  DIAGNOSIS_PARENT,
  MYALGIA_SUBTYPE_IDS,
  REGIONS,
  evaluateAllDiagnoses,
  type CriterionStatus,
  type DiagnosisEvaluationResult,
  type DiagnosisId,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
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
import { EMPTY_REGION_STATUS, type RegionStatus } from "../../examination/components/HeadDiagram";
import { mapToCriteriaData } from "../utils/map-to-criteria-data";
import { DiagnosisDetailPanel } from "./DiagnosisDetailPanel";
import { PositiveDiagnosesList, type PositiveGroup } from "./PositiveDiagnosesList";
import { RegionDiagnosisList } from "./RegionDiagnosisList";
import { SummaryDiagrams } from "./SummaryDiagrams";

interface EvaluationViewProps {
  sqAnswers: Record<string, unknown>;
  examinationData: FormValues;
}

/** Regions shown in the head diagrams and used for filtering */
const DIAGRAM_REGIONS: readonly Region[] = ["temporalis", "masseter", "tmj"];

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
  { id: "myalgia", label: "Myalgie", regions: ["temporalis", "masseter"] },
  { id: "myalgiaSubtypes", label: "Myalgie-Subtypen", regions: ["temporalis", "masseter"] },
  { id: "arthralgia", label: "Arthralgie", regions: ["tmj"] },
  { id: "headache", label: "Auf CMD zurückgeführte Kopfschmerzen", regions: ["temporalis"] },
  { id: "ddWithReduction", label: "Diskusverlagerung", regions: ["tmj"] },
  { id: "degenerativeJointDisease", label: "Degenerative Gelenkerkrankung", regions: ["tmj"] },
  { id: "subluxation", label: "Subluxation", regions: ["tmj"] },
];

/** Map a DiagnosisId (from positive diagnoses list) to its tree type. */
function diagnosisToTreeType(id: DiagnosisId): TreeTypeId {
  if (MYALGIA_SUBTYPE_IDS.includes(id)) return "myalgiaSubtypes";
  switch (id) {
    case "myalgia":
      return "myalgia";
    case "arthralgia":
      return "arthralgia";
    case "headacheAttributedToTmd":
      return "headache";
    case "discDisplacementWithReduction":
    case "discDisplacementWithReductionIntermittentLocking":
    case "discDisplacementWithoutReductionLimitedOpening":
    case "discDisplacementWithoutReductionWithoutLimitedOpening":
      return "ddWithReduction";
    case "degenerativeJointDisease":
      return "degenerativeJointDisease";
    case "subluxation":
      return "subluxation";
    default:
      return "myalgia";
  }
}

/**
 * Flatten parent/subtype hierarchy:
 * - If any subtype of a parent is positive, show only the positive subtypes
 * - Otherwise show the parent
 * - Diagnoses without subtypes pass through unchanged
 */
function flattenResults(results: DiagnosisEvaluationResult[]): DiagnosisEvaluationResult[] {
  const flat: DiagnosisEvaluationResult[] = [];

  const parentIds = new Set(
    results
      .map((r) => DIAGNOSIS_PARENT[r.diagnosisId as keyof typeof DIAGNOSIS_PARENT])
      .filter(Boolean) as DiagnosisId[]
  );

  for (const result of results) {
    const isSubtype = !!DIAGNOSIS_PARENT[result.diagnosisId as keyof typeof DIAGNOSIS_PARENT];
    if (isSubtype) continue;

    if (parentIds.has(result.diagnosisId as DiagnosisId)) {
      const subtypes = results.filter(
        (r) =>
          DIAGNOSIS_PARENT[r.diagnosisId as keyof typeof DIAGNOSIS_PARENT] === result.diagnosisId
      );
      const positiveSubtypes = subtypes.filter((r) => r.status === "positive");

      if (positiveSubtypes.length > 0) {
        flat.push(...positiveSubtypes);
      } else {
        flat.push(result);
      }
    } else {
      flat.push(result);
    }
  }

  return flat;
}

/**
 * Combine a CriterionStatus into a RegionStatus for the HeadDiagram.
 *
 * Mapping:
 * - positive → blue (familiar pain positive)
 * - negative → dark gray (complete, no findings)
 * - pending  → light gray (no data / EMPTY_REGION_STATUS)
 */
function criterionStatusToRegionStatus(status: CriterionStatus): RegionStatus {
  switch (status) {
    case "positive":
      return {
        hasData: true,
        isPainPositive: true,
        hasFamiliarPainData: true,
        hasFamiliarPain: true,
        hasFamiliarHeadacheData: false,
        hasFamiliarHeadache: false,
        isComplete: true,
      };
    case "negative":
      return {
        hasData: true,
        isPainPositive: false,
        hasFamiliarPainData: true,
        hasFamiliarPain: false,
        hasFamiliarHeadacheData: false,
        hasFamiliarHeadache: false,
        isComplete: true,
      };
    case "pending":
      return EMPTY_REGION_STATUS;
  }
}

/**
 * Compute effective status for a diagnosis at a specific (side, region).
 * effectiveStatus = min(anamnesisStatus, locationExamStatus)
 * where: positive > pending > negative
 * i.e. if either is negative → negative; if either is pending → pending; else positive
 */
function computeEffectiveStatus(
  anamnesisStatus: CriterionStatus,
  locationStatus: CriterionStatus | undefined
): CriterionStatus {
  if (!locationStatus) return anamnesisStatus;
  if (anamnesisStatus === "negative" || locationStatus === "negative") return "negative";
  if (anamnesisStatus === "pending" || locationStatus === "pending") return "pending";
  return "positive";
}

/**
 * Aggregate multiple CriterionStatus values:
 * any positive → positive, else any pending → pending, else negative
 */
function aggregateStatus(statuses: CriterionStatus[]): CriterionStatus {
  if (statuses.length === 0) return "pending";
  if (statuses.some((s) => s === "positive")) return "positive";
  if (statuses.some((s) => s === "pending")) return "pending";
  return "negative";
}

export function EvaluationView({ sqAnswers, examinationData }: EvaluationViewProps) {
  // ── State ──────────────────────────────────────────────────────────
  const [selectedSide, setSelectedSide] = useState<Side>("right");
  const [selectedRegion, setSelectedRegion] = useState<Region>("temporalis");
  const [userSelectedTree, setUserSelectedTree] = useState<TreeTypeId | null>(null);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<DiagnosisId | null>(null);

  // ── Memos (dependency order) ───────────────────────────────────────

  // 1. Criteria data from raw inputs
  const criteriaData = useMemo(
    () => mapToCriteriaData(sqAnswers, examinationData),
    [sqAnswers, examinationData]
  );

  // 2. Evaluate all diagnoses
  const allResults = useMemo(
    () => evaluateAllDiagnoses(ALL_DIAGNOSES, criteriaData),
    [criteriaData]
  );

  // 3. Flatten parent/subtype hierarchy
  const flatResults = useMemo(() => flattenResults(allResults), [allResults]);

  // 4. Aggregate region statuses for head diagrams
  const aggregateRegionStatuses = useMemo(() => {
    const statuses: Record<Side, Partial<Record<Region, RegionStatus>>> = {
      right: {},
      left: {},
    };

    for (const side of ["right", "left"] as Side[]) {
      for (const region of DIAGRAM_REGIONS) {
        // Collect all location statuses across all flat results for this (side, region)
        const locationStatuses: CriterionStatus[] = [];
        for (const result of flatResults) {
          const def = ALL_DIAGNOSES.find((d) => d.id === result.diagnosisId);
          if (!def?.examination.regions.includes(region)) continue;

          const loc = result.locationResults.find((l) => l.side === side && l.region === region);
          if (loc) {
            locationStatuses.push(computeEffectiveStatus(result.anamnesisStatus, loc.status));
          }
        }
        const combined = aggregateStatus(locationStatuses);
        statuses[side][region] = criterionStatusToRegionStatus(combined);
      }
    }

    return statuses;
  }, [flatResults]);

  // 5. Positive diagnoses grouped by (region, side) for the left panel
  const positiveGroups = useMemo((): PositiveGroup[] => {
    const groups: PositiveGroup[] = [];
    const seen = new Set<string>();

    // Ordered: temporalis → masseter → tmj, right → left
    for (const region of DIAGRAM_REGIONS) {
      for (const side of ["right", "left"] as Side[]) {
        for (const result of flatResults) {
          if (result.status !== "positive") continue;
          const hasLocation = result.positiveLocations.some(
            (loc) => loc.side === side && loc.region === region
          );
          if (!hasLocation) continue;

          const key = `${side}-${region}`;
          const def = ALL_DIAGNOSES.find((d) => d.id === result.diagnosisId);
          if (!def) continue;

          // Deduplicate: same diagnosis at same (side, region)
          const dedupKey = `${key}-${result.diagnosisId}`;
          if (seen.has(dedupKey)) continue;
          seen.add(dedupKey);

          let group = groups.find((g) => g.side === side && g.region === region);
          if (!group) {
            group = { region, side, diagnoses: [] };
            groups.push(group);
          }
          group.diagnoses.push({
            diagnosisId: result.diagnosisId as DiagnosisId,
            nameDE: def.nameDE,
          });
        }
      }
    }

    return groups;
  }, [flatResults]);

  // 6. Tree types applicable to the selected region
  const currentTreeTypes = useMemo(
    () => TREE_TYPES.filter((t) => t.regions.includes(selectedRegion)),
    [selectedRegion]
  );

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

  // ── Handlers ───────────────────────────────────────────────────────

  const handleRegionClick = useCallback((side: Side, region: Region) => {
    setSelectedSide(side);
    setSelectedRegion(region);
  }, []);

  const handlePositiveDiagnosisClick = useCallback(
    (side: Side, region: Region, diagnosisId: DiagnosisId) => {
      setSelectedSide(side);
      setSelectedRegion(region);
      setUserSelectedTree(diagnosisToTreeType(diagnosisId));
      setSelectedDiagnosisId(diagnosisId);
    },
    []
  );

  const handleTreeSelect = useCallback((id: string) => {
    setUserSelectedTree(id as TreeTypeId);
  }, []);

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Positive diagnoses + head diagrams */}
      <Card>
        <CardHeader>
          <CardTitle>Positive DC/TMD-Kriterien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Positive diagnoses list */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              <PositiveDiagnosesList
                groups={positiveGroups}
                selectedSide={selectedSide}
                selectedRegion={selectedRegion}
                selectedTree={selectedTree}
                diagnosisToTree={diagnosisToTreeType}
                onDiagnosisClick={handlePositiveDiagnosisClick}
              />
            </div>
            {/* Head diagrams — visual region+side selector */}
            <div className="flex-1 flex items-center justify-center">
              <SummaryDiagrams
                regionStatuses={aggregateRegionStatuses}
                regions={DIAGRAM_REGIONS}
                selectedSide={selectedSide}
                selectedRegion={selectedRegion}
                onRegionClick={handleRegionClick}
              />
            </div>
          </div>

          {/* Clinical context for selected positive diagnosis */}
          {selectedDiagnosisId &&
            positiveGroups.some((g) =>
              g.diagnoses.some((d) => d.diagnosisId === selectedDiagnosisId)
            ) && <DiagnosisDetailPanel diagnosisId={selectedDiagnosisId} />}
        </CardContent>
      </Card>

      {/* Decision tree explorer */}
      <Card>
        <CardHeader>
          <CardTitle>DC/TMD-Kriterien im diagnostischen Flussdiagramm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Region & Side toggles */}
          <div className="flex flex-col gap-2">
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

          {/* Two-panel: diagnosis sidebar + decision tree */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left sidebar: diagnosis list */}
            <div className="lg:w-80 xl:w-96 shrink-0 lg:border-r lg:pr-4">
              <RegionDiagnosisList
                treeTypes={currentTreeTypes}
                selectedTree={selectedTree}
                onTreeSelect={handleTreeSelect}
              />
            </div>

            {/* Right panel: decision tree */}
            <div className="flex-1 min-w-0">
              {treeData ? (
                <ScrollArea className="w-full">
                  <div className="min-w-fit pb-4">
                    <DecisionTreeView
                      tree={treeData}
                      data={criteriaData}
                      onLinkedNodeClick={handleTreeSelect}
                    />
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Kein Entscheidungsbaum für die aktuelle Diagnose verfügbar.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
