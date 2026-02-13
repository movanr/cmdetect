import {
  and,
  familiarHeadacheProvoked,
  field,
  HEADACHE_ANAMNESIS,
  HEADACHE_EXAMINATION,
  headacheLocationConfirmed,
  sq,
  type Side,
} from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/**
 * Generate the headache attributed to TMD decision tree for a specific side.
 *
 * Nodes map to DC/TMD headache criteria:
 * 1. Headache anamnesis (SQ history A+B)
 * 2. Headache location confirmed in temporalis (E1b criterion C)
 * 3. Familiar headache from opening, movement, or palpation (E4/E5/E9 criterion D)
 * 4. Headache attributed to TMD — positive diagnosis end node
 * 5. Investigate other — negative end node
 *
 * Note: This diagnosis additionally requires a primary diagnosis of
 * Myalgia or Arthralgia (enforced by the evaluation system, not the tree).
 */
export function createHeadacheTree(side: Side): DecisionTreeDef {
  const ctx = { side, region: "temporalis" as const };

  const sideLabel = side === "right" ? "Rechts" : "Links";

  // Layout constants
  const colCenter = 150;
  const nodeW = 300;
  const endW = 200;
  const endH = 80;

  const nodes: TreeNodeDef[] = [
    {
      id: "anamnesis",
      label: "Kopfschmerz-Anamnese",
      subItems: {
        labels: [
          "Kopfschmerz in der Schläfenregion",
          "Kopfschmerz, der durch Kieferbewegungen, Funktion oder Parafunktion modifiziert wird",
        ],
        connector: "UND",
      },
      criterion: HEADACHE_ANAMNESIS,
      center: { x: colCenter, y: 65 },
      width: nodeW,
      height: 130,
    },
    {
      id: "headacheLocation",
      label: "Kopfschmerzlokalisation bestätigt",
      subLabel: "Kopfschmerz im Bereich des M. temporalis",
      criterion: headacheLocationConfirmed,
      context: ctx,
      center: { x: colCenter, y: 225 },
      width: nodeW,
      height: 120,
    },
    {
      id: "familiarHeadache",
      label: "Bekannter Kopfschmerz",
      subItems: {
        labels: [
          "Bekannter Kopfschmerz bei Mundöffnung",
          "Bekannter Kopfschmerz bei Lateral-/Protrusionsbewegung",
          "Bekannter Kopfschmerz bei Palpation",
        ],
        connector: "ODER",
      },
      criterion: familiarHeadacheProvoked,
      context: ctx,
      center: { x: colCenter, y: 410 },
      width: nodeW,
      height: 190,
    },
    {
      id: "headache",
      label: "Auf CMD zurückgeführte Kopfschmerzen",
      color: "blue",
      isEndNode: true,
      diagnosisId: "headacheAttributedToTmd",
      criterion: and([HEADACHE_ANAMNESIS, HEADACHE_EXAMINATION.criterion]),
      context: ctx,
      center: { x: colCenter, y: 580 },
      width: endW,
      height: endH,
    },
    {
      id: "investigateOther",
      label: "Weitere Schmerzdiagnosen untersuchen",
      negativeLabel: `Keine Hinweise auf Kopfschmerzen in (Temporalis, ${sideLabel}) gefunden`,
      color: "red",
      isEndNode: true,
      criterion: and([
        field(sq("SQ5"), { equals: "yes" }),
        field(`e1.headacheLocation.${side}`, { includes: "temporalis" }),
      ]),
      center: { x: 430, y: 65 },
      width: 180,
      height: 80,
    },
  ];

  const transitions: TransitionFromIds[] = [
    {
      from: "anamnesis",
      to: "headacheLocation",
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
      from: "headacheLocation",
      to: "familiarHeadache",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "headacheLocation",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
    {
      from: "familiarHeadache",
      to: "headache",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "familiarHeadache",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  ];

  return {
    id: `headache-${side}-temporalis`,
    title: `Auf CMD zurückgeführte Kopfschmerzen (Temporalis, ${sideLabel})`,
    side,
    region: "temporalis",
    nodes,
    transitions,
  };
}
