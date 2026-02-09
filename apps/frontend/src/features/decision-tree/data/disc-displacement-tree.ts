import {
  and,
  computed,
  field,
  sq,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING,
  type Side,
} from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/**
 * Generate the disc displacement decision tree for a specific side.
 *
 * Simplified path covering only DD without Reduction:
 * 1. DD without Reduction anamnesis (SQ9 + SQ10)
 * 2. Opening measurement branch (maxAssisted + verticalOverlap vs 40mm)
 * 3. End nodes: with limited opening (<40) or without limited opening (≥40)
 */
export function createDiscDisplacementTree(side: Side): DecisionTreeDef {
  const ctx = { side, region: "tmj" as const };

  // Layout constants
  const colCenter = 200;
  const nodeW = 320;
  const endW = 240;
  const endH = 80;

  // Shared anamnesis criterion: SQ9=yes AND SQ10=yes
  const ddWithoutReductionAnamnesis = and(
    [
      field(sq("SQ9"), { equals: "yes" }),
      field(sq("SQ10"), { equals: "yes" }),
    ],
    { id: "ddWithoutReductionHistory", label: "DV ohne Reposition-Anamnese" }
  );

  // Opening measurement: maxAssisted + verticalOverlap
  const openingLimited = computed(
    ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
    (v) =>
      ((v["e4.maxAssisted.measurement"] as number) ?? 0) +
      ((v["e2.verticalOverlap"] as number) ?? 0),
    "<",
    40
  );

  const nodes: TreeNodeDef[] = [
    {
      id: "anamnesis",
      label: "DV ohne Reposition — Anamnese",
      subItems: {
        labels: [
          "Kiefer hat sich jemals verklemmt/verfangen (SQ9)",
          "Einschränkung schwer genug, um das Essen zu beeinträchtigen (SQ10)",
        ],
        connector: "UND",
      },
      criterion: ddWithoutReductionAnamnesis,
      center: { x: colCenter, y: 65 },
      width: nodeW,
      height: 130,
    },
    {
      id: "openingMeasurement",
      label: "Mundöffnung eingeschränkt?",
      subLabel: "Max. assistierte Öffnung + Vertikaler Überbiss < 40 mm",
      criterion: openingLimited,
      context: ctx,
      center: { x: colCenter, y: 240 },
      width: nodeW,
      height: 100,
    },
    {
      id: "limitedOpening",
      label: "DV ohne Reposition, mit Mundöffnungseinschränkung",
      color: "blue",
      isEndNode: true,
      criterion: and([
        ddWithoutReductionAnamnesis,
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.examination.criterion,
      ]),
      context: ctx,
      center: { x: colCenter - 170, y: 400 },
      width: endW,
      height: endH,
    },
    {
      id: "noLimitedOpening",
      label: "DV ohne Reposition, ohne Mundöffnungseinschränkung",
      color: "blue",
      isEndNode: true,
      criterion: and([
        ddWithoutReductionAnamnesis,
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING.examination.criterion,
      ]),
      context: ctx,
      center: { x: colCenter + 170, y: 400 },
      width: endW,
      height: endH,
    },
    {
      id: "noDiscDisplacement",
      label: "Keine DV ohne Reposition",
      color: "red",
      isEndNode: true,
      center: { x: colCenter + 350, y: 65 },
      width: 180,
      height: 80,
    },
  ];

  const transitions: TransitionFromIds[] = [
    {
      from: "anamnesis",
      to: "openingMeasurement",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "anamnesis",
      to: "noDiscDisplacement",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
    {
      from: "openingMeasurement",
      to: "limitedOpening",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "openingMeasurement",
      to: "noLimitedOpening",
      startDirection: "down",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
  ];

  const sideLabel = side === "right" ? "Rechts" : "Links";

  return {
    id: `disc-displacement-${side}-tmj`,
    title: `Diskusverlagerung (KG, ${sideLabel})`,
    side,
    region: "tmj",
    nodes,
    transitions,
  };
}
