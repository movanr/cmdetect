/**
 * Headache Attributed to TMD Decision Tree
 *
 * Matches the official DC/TMD diagnostic flowchart:
 * "Schmerzbezogene CMD-Diagnosen und Kopfschmerzen"
 *
 * Headache pathway: prerequisite (myalgia/arthralgia) → anamnesis → location
 * confirmation → examination → differential exclusion → diagnosis.
 * Labels use exact German wordings from the official flowchart.
 */

import type { Side } from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

export function createHeadacheTree(side: Side): DecisionTreeDef {
  const sideLabel = side === "right" ? "Rechts" : "Links";

  // Layout
  const mainCol = 220;
  const rightCol = 550;
  const decisionW = 340;
  const decisionH = 100;
  const diagnosisW = 260;
  const diagnosisH = 80;
  const redW = 200;
  const redH = 80;

  // Vertical spacing
  let y = 60;
  const gap = 130;

  const nodes: TreeNodeDef[] = [];
  const transitions: TransitionFromIds[] = [];

  // ── 0. Prerequisite: existing myalgia or arthralgia ───────────────

  nodes.push({
    id: "voraussetzung",
    label: "Diagnose einer Myalgie oder Arthralgie",
    center: { x: mainCol, y },
    width: decisionW,
    height: 80,
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
      from: "voraussetzung",
      to: "anamnese",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "voraussetzung",
      to: "weitere",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 1. Anamnesis: SF5 + SF7 ──────────────────────────────────────

  y += gap;
  nodes.push({
    id: "anamnese",
    label:
      "Schläfenkopfschmerz jeglicher Art [SF5] UND Kopfschmerz wird durch funktionelle oder parafunktionelle Kieferbewegungen modifiziert [SF7]",
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH + 10,
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
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 2. U1b: Headache location confirmation ────────────────────────

  y += gap + 10;
  nodes.push({
    id: "lokalisation",
    label: "Bestätigung der Kopfschmerzlokalisation durch den Untersucher [U1b]",
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH,
  });

  transitions.push(
    {
      from: "lokalisation",
      to: "untersuchung",
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

  // ── 3. Examination: familiar headache ─────────────────────────────

  y += gap + 20;
  nodes.push({
    id: "untersuchung",
    label: "Bekannter Kopfschmerz durch:",
    subItems: {
      labels: [
        "Mundöffnung",
        "excursive Kieferbewegungen",
        "Palpation des M. temporalis",
      ],
      connector: "ODER",
      sources: [
        ["Temporalis", "U4"],
        ["Temporalis", "U5"],
        ["Temporalis", "U9"],
      ],
    },
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH + 40,
  });

  transitions.push(
    {
      from: "untersuchung",
      to: "ausschluss",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "untersuchung",
      to: "weitere",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 4. Differential exclusion ─────────────────────────────────────

  y += gap + 10;
  nodes.push({
    id: "ausschluss",
    label:
      "Kopfschmerzen, die nicht besser durch eine andere Diagnose erklärt werden können",
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH,
  });

  transitions.push(
    {
      from: "ausschluss",
      to: "kopfschmerzen",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "ausschluss",
      to: "weitere",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  );

  // ── 5. Diagnosis ──────────────────────────────────────────────────

  y += gap;
  nodes.push({
    id: "kopfschmerzen",
    label: "Auf CMD zurückgeführte Kopfschmerzen",
    color: "blue",
    isEndNode: true,
    diagnosisId: "headacheAttributedToTmd",
    center: { x: mainCol, y },
    width: diagnosisW,
    height: diagnosisH,
  });

  return {
    id: `headache-${side}-temporalis`,
    title: `Auf CMD zurückgeführte Kopfschmerzen (Temporalis, ${sideLabel})`,
    side,
    region: "temporalis",
    nodes,
    transitions,
  };
}
