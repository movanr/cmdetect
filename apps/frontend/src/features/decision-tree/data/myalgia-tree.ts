import {
  and,
  familiarPainProvoked,
  field,
  MYALGIA_ANAMNESIS,
  MYALGIA_EXAMINATION,
  painInMasticatoryStructure,
  painLocationConfirmed,
  painModifiedByFunction,
  REGIONS,
  sq,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/**
 * Generate the myalgia decision tree for a specific side and region.
 *
 * Nodes map to DC/TMD myalgia criteria:
 * 1. Myalgia anamnesis (SQ history A+B)
 * 2. Pain location confirmed (E1 criterion C)
 * 3. Familiar pain from opening or palpation (E4/E9 or E4/E10 criterion D)
 * 4. Myalgia — positive diagnosis end node
 * 5. Investigate other — negative end node
 */
export function createMyalgiaTree(side: Side, region: Region): DecisionTreeDef {
  const ctx = { side, region };

  const sideLabel = side === "right" ? "Rechts" : "Links";
  const regionLabel = REGIONS[region];

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
      criterion: painLocationConfirmed,
      context: ctx,
      center: { x: colCenter, y: 290 },
      width: nodeW,
      height: 100,
    },
    {
      id: "familiarPain",
      label: "Bekannter Schmerz",
      subItems: {
        labels: ["Bekannter Schmerz bei maximaler Mundöffnung", "Bekannter Schmerz bei Palpation"],
        connector: "ODER",
      },
      criterion: familiarPainProvoked,
      context: ctx,
      center: { x: colCenter, y: 455 },
      width: nodeW,
      height: 150,
    },
    {
      id: "myalgia",
      label: "Myalgie",
      color: "blue",
      isEndNode: true,
      diagnosisId: "myalgia",
      criterion: and([MYALGIA_ANAMNESIS, MYALGIA_EXAMINATION.criterion]),
      context: ctx,
      center: { x: colCenter, y: 625 },
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
        field(`e1.painLocation.${side}`, { includes: region }),
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
      to: "myalgia",
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
    id: `myalgia-${side}-${region}`,
    title: `Myalgie (${regionLabel}, ${sideLabel})`,
    side,
    region,
    nodes,
    transitions,
  };
}
