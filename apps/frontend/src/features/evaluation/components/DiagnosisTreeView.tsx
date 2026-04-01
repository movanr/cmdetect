/**
 * DiagnosisTreeView — Decision tree display for all DC/TMD diagnoses.
 *
 * Dropdown shows one entry per unique decision tree. When a specific
 * DiagnosisId is passed from the parent, the matching tree is shown
 * and the dropdown reflects the corresponding tree option.
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
import type { DiagnosisId } from "@cmdetect/dc-tmd";
import { useMemo, useState } from "react";
import {
  DecisionTreeView,
  createArthalgiaTree,
  createDdWithReductionTree,
  createDjdTree,
  createHeadacheTree,
  createMyalgiaCombinedTree,
  type DecisionTreeDef,
} from "../../decision-tree";

// ── Tree options (one per unique decision tree) ─────────────────────

interface TreeOption {
  id: string;
  label: string;
  category: "pain" | "joint";
  create: () => DecisionTreeDef;
}

const TREE_OPTIONS: TreeOption[] = [
  {
    id: "myalgia",
    label: "Myalgie & Subtypen",
    category: "pain",
    create: () => createMyalgiaCombinedTree("right", "temporalis"),
  },
  {
    id: "arthralgia",
    label: "Arthralgie",
    category: "pain",
    create: () => createArthalgiaTree("right"),
  },
  {
    id: "headache",
    label: "Auf CMD zurückgeführte Kopfschmerzen",
    category: "pain",
    create: () => createHeadacheTree("right"),
  },
  {
    id: "disc-displacement",
    label: "Diskusverlagerung",
    category: "joint",
    create: () => createDdWithReductionTree("right"),
  },
  {
    id: "djd",
    label: "Degenerative Gelenkerkrankung",
    category: "joint",
    create: () => createDjdTree("right"),
  },
];

const GROUPED_OPTIONS = {
  pain: TREE_OPTIONS.filter((t) => t.category === "pain"),
  joint: TREE_OPTIONS.filter((t) => t.category === "joint"),
};

/** Map any DiagnosisId to the corresponding tree option id */
function diagnosisToTreeId(diagnosisId: DiagnosisId): string | null {
  switch (diagnosisId) {
    case "myalgia":
    case "localMyalgia":
    case "myofascialPainWithSpreading":
    case "myofascialPainWithReferral":
      return "myalgia";
    case "arthralgia":
      return "arthralgia";
    case "headacheAttributedToTmd":
      return "headache";
    case "discDisplacementWithReduction":
    case "discDisplacementWithReductionIntermittentLocking":
    case "discDisplacementWithoutReductionLimitedOpening":
    case "discDisplacementWithoutReductionWithoutLimitedOpening":
      return "disc-displacement";
    case "degenerativeJointDisease":
      return "djd";
    default:
      return null;
  }
}

// ── Component ───────────────────────────────────────────────────────

interface DiagnosisTreeViewProps {
  selectedDiagnosisId?: DiagnosisId | null;
}

export function DiagnosisTreeView({ selectedDiagnosisId }: DiagnosisTreeViewProps) {
  const [localTreeId, setLocalTreeId] = useState<string | null>(null);

  // If parent provides a diagnosis, resolve to tree id; otherwise use local state
  const selectedTreeId = selectedDiagnosisId
    ? diagnosisToTreeId(selectedDiagnosisId)
    : localTreeId;

  const selectedOption = TREE_OPTIONS.find((t) => t.id === selectedTreeId);
  const tree = useMemo(() => selectedOption?.create() ?? null, [selectedOption]);

  function handleChange(treeId: string) {
    setLocalTreeId(treeId);
    // Don't call onDiagnosisChange — dropdown selection is tree-level,
    // the parent's diagnosis selection stays intact
  }

  return (
    <div className="space-y-4">
      <Select
        value={selectedTreeId ?? ""}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-auto min-w-[280px]">
          <SelectValue placeholder="Entscheidungsbaum wählen..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Schmerzerkrankungen</SelectLabel>
            {GROUPED_OPTIONS.pain.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Gelenkerkrankungen</SelectLabel>
            {GROUPED_OPTIONS.joint.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {tree && (
        <div className="overflow-auto">
          <DecisionTreeView tree={tree} />
        </div>
      )}
    </div>
  );
}
