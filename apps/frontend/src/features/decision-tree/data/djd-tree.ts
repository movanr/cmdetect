/**
 * Degenerative Joint Disease (DJD) Decision Tree
 *
 * Matches the official DC/TMD diagnostic flowchart:
 * "Intra-articuläre Dysfunktionen und Degenerative Dysfunktionen"
 *
 * DJD pathway: TMJ noise anamnesis → crepitus check → diagnosis.
 * Labels use exact German wordings from the official flowchart.
 */

import type { Side } from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

export function createDjdTree(side: Side): DecisionTreeDef {
  const sideLabel = side === "right" ? "Rechts" : "Links";

  // Layout
  const mainCol = 220;
  const rightCol = 550;
  const decisionW = 340;
  const decisionH = 100;
  const diagnosisW = 240;
  const diagnosisH = 80;
  const redW = 200;
  const redH = 80;

  // Vertical spacing
  let y = 60;
  const gap = 130;

  const nodes: TreeNodeDef[] = [];
  const transitions: TransitionFromIds[] = [];

  // ── 1. TMJ noise anamnesis ────────────────────────────────────────

  nodes.push({
    id: "geraeusch",
    label: "",
    subItems: {
      labels: [
        "Aktuelle Kiefergelenkgeräusche (anamnestisch) [SF8]",
        "Angabe von Kiefergelenkgeräuschen durch den Pat. während Untersuchung [U6 ODER U7]",
      ],
      connector: "ODER",
    },
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH + 30,
  });

  // ── Red end node ──────────────────────────────────────────────────

  nodes.push({
    id: "weitere",
    label: "Weitere Diagnosen untersuchen",
    color: "red",
    isEndNode: true,
    center: { x: rightCol, y },
    width: redW,
    height: redH,
  });

  transitions.push(
    {
      from: "geraeusch",
      to: "reibegeraeusch",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "geraeusch",
      to: "weitere",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 2. Crepitus check ─────────────────────────────────────────────

  y += gap + 10;
  nodes.push({
    id: "reibegeraeusch",
    label: "Reibegeräusch durch Untersucher ermittelt [U6 ODER U7]",
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH,
  });

  transitions.push(
    {
      from: "reibegeraeusch",
      to: "djd",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "reibegeraeusch",
      to: "weitere",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 3. Diagnosis ──────────────────────────────────────────────────

  y += gap;
  nodes.push({
    id: "djd",
    label: "Degenerative Gelenkerkrankung",
    color: "blue",
    isEndNode: true,
    diagnosisId: "degenerativeJointDisease",
    imagingNote: "CT",
    center: { x: mainCol, y },
    width: diagnosisW,
    height: diagnosisH,
  });

  return {
    id: `djd-${side}-tmj`,
    title: `Degenerative Gelenkerkrankung (KG, ${sideLabel})`,
    side,
    region: "tmj",
    nodes,
    transitions,
  };
}
