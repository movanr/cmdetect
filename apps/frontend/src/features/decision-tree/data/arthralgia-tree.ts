import {
  and,
  ARTHRALGIA_ANAMNESIS,
  ARTHRALGIA_EXAMINATION,
  familiarPainProvokedTmj,
  field,
  painInMasticatoryStructure,
  painLocationConfirmedTmj,
  painModifiedByFunction,
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
      id: "painInMasticatory",
      label: "Schmerz in einer mastikatorischen Struktur",
      criterion: painInMasticatoryStructure,
      sources: ["SF1", "SF3"],
      center: { x: colCenter, y: 50 },
      width: nodeW,
      height: 100,
    },
    {
      id: "painModified",
      label: "Schmerz, der durch Kieferbewegungen, Funktion oder Parafunktion modifiziert wird",
      criterion: painModifiedByFunction,
      sources: ["SF4"],
      center: { x: colCenter, y: 170 },
      width: nodeW,
      height: 100,
    },
    {
      id: "painLocation",
      label: "Schmerzlokalisation bestätigt",
      subLabel: "KG-Schmerz im Bereich des Kiefergelenks",
      criterion: painLocationConfirmedTmj,
      context: ctx,
      center: { x: colCenter, y: 295 },
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
      },
      criterion: familiarPainProvokedTmj,
      context: ctx,
      center: { x: colCenter, y: 500 },
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
      center: { x: colCenter, y: 695 },
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
      center: { x: 430, y: 50 },
      width: 180,
      height: 80,
    },
  ];

  const transitions: TransitionFromIds[] = [
    {
      from: "painInMasticatory",
      to: "painModified",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "painInMasticatory",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
    {
      from: "painModified",
      to: "painLocation",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "painModified",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "up",
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
