/**
 * DiagnosisTreeView — Decision tree display for all DC/TMD diagnoses.
 *
 * Shows a selectable list of diagnoses, each rendering its decision tree
 * when selected. Uses a default side ("right") and first applicable region.
 */

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_DIAGNOSES, type DiagnosisId } from "@cmdetect/dc-tmd";
import { useMemo, useState } from "react";
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

interface DiagnosisTreeViewProps {
  selectedDiagnosisId?: DiagnosisId | null;
  onDiagnosisChange?: (id: DiagnosisId | null) => void;
}

const GROUPED = {
  pain: ALL_DIAGNOSES.filter((d) => d.category === "pain"),
  joint: ALL_DIAGNOSES.filter((d) => d.category === "joint"),
};

function createTree(diagnosisId: DiagnosisId) {
  switch (diagnosisId) {
    case "myalgia":
      return createMyalgiaTree("right", "temporalis");
    case "localMyalgia":
    case "myofascialPainWithSpreading":
    case "myofascialPainWithReferral":
      return createMyalgiaSubtypesTree("right", "temporalis");
    case "arthralgia":
      return createArthalgiaTree("right");
    case "headacheAttributedToTmd":
      return createHeadacheTree("right");
    case "discDisplacementWithReduction":
    case "discDisplacementWithReductionIntermittentLocking":
    case "discDisplacementWithoutReductionLimitedOpening":
    case "discDisplacementWithoutReductionWithoutLimitedOpening":
      return createDdWithReductionTree("right");
    case "degenerativeJointDisease":
      return createDjdTree("right");
    case "subluxation":
      return createSubluxationTree("right");
    default:
      return null;
  }
}

export function DiagnosisTreeView({ selectedDiagnosisId, onDiagnosisChange }: DiagnosisTreeViewProps) {
  const [localSelectedId, setLocalSelectedId] = useState<DiagnosisId | null>(null);
  const selectedId = selectedDiagnosisId ?? localSelectedId;

  function handleChange(id: DiagnosisId) {
    setLocalSelectedId(id);
    onDiagnosisChange?.(id);
  }

  const tree = useMemo(() => (selectedId ? createTree(selectedId) : null), [selectedId]);

  return (
    <div className="space-y-4">
      <Select
        value={selectedId ?? ""}
        onValueChange={(v) => handleChange(v as DiagnosisId)}
      >
        <SelectTrigger className="w-auto min-w-[280px]">
          <SelectValue placeholder="Diagnose wählen..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Schmerzerkrankungen</SelectLabel>
            {GROUPED.pain.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.nameDE}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Gelenkerkrankungen</SelectLabel>
            {GROUPED.joint.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.nameDE}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {tree && (
        <div className="overflow-x-auto">
          <DecisionTreeView tree={tree} />
        </div>
      )}

      {!tree && selectedId && (
        <p className="text-sm text-muted-foreground italic">
          Kein Entscheidungsbaum für diese Diagnose verfügbar.
        </p>
      )}
    </div>
  );
}
