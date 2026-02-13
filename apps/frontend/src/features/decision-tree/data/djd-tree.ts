import { and, DEGENERATIVE_JOINT_DISEASE, field, sq, TMJ_NOISE_ANAMNESIS, TMJ_NOISE_SIDED_ANAMNESIS, type Side } from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/**
 * Degenerative Joint Disease (DJD) detail tree — Level 2 decision tree.
 *
 * Path:
 * 1. TMJ Noise anamnesis (gateway)
 * 2. TMJ Noise sided anamnesis (side gate)
 * 3. Crepitus by examiner (E6/E7 examination criterion)
 * 4. End node: DGE (blue) or negative (red)
 */
export function createDjdTree(side: Side): DecisionTreeDef {
  const ctx = { side, region: "tmj" as const };

  const sideLabel = side === "right" ? "Rechts" : "Links";

  // Layout constants
  const colCenter = 200;
  const nodeW = 320;
  const endW = 200;
  const endH = 80;

  const nodes: TreeNodeDef[] = [
    {
      id: "noise",
      label: "Anamnese",
      subLabel:
        "Anamnestisch aktuell vorhandenes KG-Geräusch, ODER Patient gibt während der Untersuchung Geräusche an (SF 8, U6/U7)",
      criterion: TMJ_NOISE_ANAMNESIS,
      center: { x: colCenter, y: 60 },
      width: nodeW,
      height: 100,
    },
    {
      id: "noiseSided",
      label: "Seitenangabe — KG-Geräusch",
      subLabel:
        `Geräusch auf dieser Seite angegeben (${sideLabel}): SF 8 Seitenangabe ODER Patientenangabe U6/U7`,
      criterion: TMJ_NOISE_SIDED_ANAMNESIS,
      context: ctx,
      center: { x: colCenter, y: 210 },
      width: nodeW,
      height: 100,
    },
    {
      id: "crepitus",
      label: "Untersuchung",
      subLabel: "Reiben bei Kieferbewegungen (U6 oder U7)",
      criterion: DEGENERATIVE_JOINT_DISEASE.examination.criterion,
      context: ctx,
      center: { x: colCenter, y: 360 },
      width: nodeW,
      height: 100,
    },
    {
      id: "djd",
      label: "Degenerative Gelenkerkrankung",
      color: "blue",
      isEndNode: true,
      diagnosisId: "degenerativeJointDisease",
      imagingNote: "CT",
      criterion: and([DEGENERATIVE_JOINT_DISEASE.anamnesis, DEGENERATIVE_JOINT_DISEASE.examination.criterion]),
      context: ctx,
      center: { x: colCenter, y: 520 },
      width: endW,
      height: endH,
    },
    {
      id: "noDjd",
      label: "Weitere Diagnosen untersuchen",
      color: "red",
      isEndNode: true,
      criterion: field(sq("SQ8"), { equals: "yes" }),
      center: { x: colCenter + 350, y: 60 },
      width: 220,
      height: 80,
    },
  ];

  const transitions: TransitionFromIds[] = [
    {
      from: "noise",
      to: "noiseSided",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "noise",
      to: "noDjd",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
    {
      from: "noiseSided",
      to: "crepitus",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "noiseSided",
      to: "noDjd",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
    {
      from: "crepitus",
      to: "djd",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "crepitus",
      to: "noDjd",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  ];

  return {
    id: `djd-${side}-tmj`,
    title: `Degenerative Gelenkerkrankung (KG, ${sideLabel})`,
    side,
    region: "tmj",
    nodes,
    transitions,
  };
}
