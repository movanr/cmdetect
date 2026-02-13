import {
  and,
  ARTHRALGIA_ANAMNESIS,
  ARTHRALGIA_EXAMINATION,
  familiarPainProvokedTmj,
  field,
  painLocationConfirmedTmj,
  sq,
  type Side,
} from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/**
 * Generate the arthralgia decision tree for a specific side.
 *
 * Nodes map to DC/TMD arthralgia criteria:
 * 1. Arthralgia anamnesis (SQ history A+B) — same as myalgia
 * 2. Pain location confirmed in TMJ (E1 criterion C)
 * 3. Familiar pain from opening, movement, or palpation (E4/E5/E9 criterion D)
 * 4. Arthralgia — positive diagnosis end node
 * 5. Investigate other — negative end node
 */
export function createArthalgiaTree(side: Side): DecisionTreeDef {
  const ctx = { side, region: "tmj" as const };

  const sideLabel = side === "right" ? "Rechts" : "Links";

  // Layout constants
  const colCenter = 150;
  const nodeW = 300;
  const endW = 200;
  const endH = 120;

  const nodes: TreeNodeDef[] = [
    {
      id: "anamnesis",
      label: "Arthralgie-Anamnese",
      subItems: {
        labels: [
          "Schmerz in einer mastikatorischen Struktur",
          "Schmerz, der durch Kieferbewegungen, Funktion oder Parafunktion modifiziert wird",
        ],
        connector: "UND",
        sources: [["SF1", "SF3"], ["SF4"]],
      },
      criterion: ARTHRALGIA_ANAMNESIS,
      center: { x: colCenter, y: 85 },
      width: nodeW,
      height: 170,
    },
    {
      id: "painLocation",
      label: "Schmerzlokalisation bestätigt",
      subLabel: "KG-Schmerz im Bereich des Kiefergelenks",
      sources: ["U1"],
      criterion: painLocationConfirmedTmj,
      context: ctx,
      center: { x: colCenter, y: 265 },
      width: nodeW,
      height: 120,
    },
    {
      id: "familiarPain",
      label: "Bekannter Schmerz",
      subItems: {
        labels: [
          "Bekannter Schmerz bei Mundöffnung",
          "Bekannter Schmerz bei Lateral-/Protrusionsbewegung",
          "Bekannter Schmerz bei Palpation",
        ],
        connector: "ODER",
        sources: [["U4"], ["U5"], ["U9"]],
      },
      criterion: familiarPainProvokedTmj,
      context: ctx,
      center: { x: colCenter, y: 450 },
      width: nodeW,
      height: 190,
    },
    {
      id: "arthralgia",
      label: "Arthralgie",
      color: "blue",
      isEndNode: true,
      diagnosisId: "arthralgia",
      criterion: and([ARTHRALGIA_ANAMNESIS, ARTHRALGIA_EXAMINATION.criterion]),
      context: ctx,
      center: { x: colCenter, y: 640 },
      width: endW,
      height: endH,
    },
    {
      id: "investigateOther",
      label: "Weitere Schmerzdiagnosen untersuchen",
      color: "red",
      isEndNode: true,
      criterion: and([
        field(sq("SQ1"), { equals: "yes" }),
        field(`e1.painLocation.${side}`, { includes: "tmj" }),
      ]),
      center: { x: 430, y: 85 },
      width: 180,
      height: 80,
    },
  ];

  const transitions: TransitionFromIds[] = [
    {
      from: "anamnesis",
      to: "painLocation",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "anamnesis",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
    {
      from: "painLocation",
      to: "familiarPain",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "painLocation",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
    {
      from: "familiarPain",
      to: "arthralgia",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "familiarPain",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  ];

  return {
    id: `arthralgia-${side}-tmj`,
    title: `Arthralgie (KG, ${sideLabel})`,
    side,
    region: "tmj",
    nodes,
    transitions,
  };
}
