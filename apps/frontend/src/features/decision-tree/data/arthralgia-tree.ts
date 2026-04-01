/**
 * Arthralgia Decision Tree
 *
 * Matches the official DC/TMD diagnostic flowchart:
 * "Schmerzbezogene CMD-Diagnosen und Kopfschmerzen"
 *
 * Arthralgia pathway: anamnesis → location confirmation → joint examination → diagnosis.
 * Labels use exact German wordings from the official flowchart.
 */

import type { Side } from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

export function createArthalgiaTree(side: Side): DecisionTreeDef {
  const sideLabel = side === "right" ? "Rechts" : "Links";

  // Layout
  const mainCol = 220;
  const rightCol = 530;
  const decisionW = 340;
  const decisionH = 100;
  const diagnosisW = 220;
  const diagnosisH = 80;
  const redW = 200;
  const redH = 80;

  // Vertical spacing
  let y = 60;
  const gap = 130;

  const nodes: TreeNodeDef[] = [];
  const transitions: TransitionFromIds[] = [];

  // ── 1. Anamnesis: SF3 + SF4 ──────────────────────────────────────

  nodes.push({
    id: "anamnese",
    isEntryNode: true,
    label:
      "Regionaler Schmerz [SF3] UND Schmerz wird durch funktionelle oder parafunktionelle Kieferbewegungen modifiziert [SF4]",
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH + 10,
  });

  // ── Red end node: Weitere Schmerzdiagnosen ────────────────────────

  nodes.push({
    id: "weitere",
    label: "Weitere Schmerzdiagnosen untersuchen",
    color: "red",
    isEndNode: true,
    center: { x: rightCol, y },
    width: redW,
    height: redH,
  });

  transitions.push(
    {
      from: "anamnese",
      to: "lokalisation",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "anamnese",
      to: "weitere",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 2. U1a: Pain location confirmation ────────────────────────────

  y += gap;
  nodes.push({
    id: "lokalisation",
    label: "Bestätigung der Schmerzlokalisation durch den Untersucher [U1a]",
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH,
  });

  transitions.push(
    {
      from: "lokalisation",
      to: "gelenkPruefung",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "lokalisation",
      to: "weitere",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 3. Joint examination: familiar pain ───────────────────────────

  y += gap + 20;
  nodes.push({
    id: "gelenkPruefung",
    label: "Bekannter Schmerz durch:",
    subItems: {
      labels: [
        "Mundöffnung [Gelenk, U4]",
        "excursive Kieferbewegungen [Gelenk, U5]",
        "Palpation des KG [Gelenk, U9]",
      ],
      connector: "ODER",
    },
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH + 40,
  });

  transitions.push(
    {
      from: "gelenkPruefung",
      to: "arthralgie",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "gelenkPruefung",
      to: "weitere",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 4. Arthralgie diagnosis ───────────────────────────────────────

  y += gap;
  nodes.push({
    id: "arthralgie",
    label: "Arthralgie",
    color: "blue",
    isEndNode: true,
    diagnosisId: "arthralgia",
    center: { x: mainCol, y },
    width: diagnosisW,
    height: diagnosisH,
  });

  return {
    id: `arthralgia-${side}-tmj`,
    title: `Arthralgie (KG, ${sideLabel})`,
    side,
    region: "tmj",
    nodes,
    transitions,
  };
}
