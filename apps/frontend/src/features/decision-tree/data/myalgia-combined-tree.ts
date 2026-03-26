/**
 * Combined Myalgia + Subtypes Decision Tree
 *
 * Matches the official DC/TMD diagnostic flowchart:
 * "Schmerzbezogene CMD-Diagnosen und Kopfschmerzen"
 *
 * One continuous tree: anamnesis → 2s palpation (myalgia) → 5s palpation (subtypes).
 * Labels use exact German wordings from the official flowchart.
 */

import { GROUP_CONFIG, REGIONS, type Region, type Side } from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

export function createMyalgiaCombinedTree(side: Side, region: Region): DecisionTreeDef {
  const hasSpreading = GROUP_CONFIG[region].hasSpreading;
  const sideLabel = side === "right" ? "Rechts" : "Links";
  const regionLabel = REGIONS[region];

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
  const diagGap = 110;

  const nodes: TreeNodeDef[] = [];
  const transitions: TransitionFromIds[] = [];

  // ── 1. Anamnesis: SF3 + SF4 ──────────────────────────────────────

  nodes.push({
    id: "anamnese",
    label: "Regionaler Schmerz [SF3] UND Schmerz wird durch funktionelle oder parafunktionelle Kieferbewegungen modifiziert [SF4]",
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
    { from: "anamnese", to: "lokalisation", startDirection: "down", endDirection: "down", type: "positive", label: "Ja" },
    { from: "anamnese", to: "weitere", startDirection: "right", endDirection: "right", type: "negative", label: "Nein" },
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
    { from: "lokalisation", to: "muskelPruefung", startDirection: "down", endDirection: "down", type: "positive", label: "Ja" },
    { from: "lokalisation", to: "weitere", startDirection: "right", endDirection: "up", type: "negative", label: "Nein" },
  );

  // ── 3. 2s palpation: familiar pain ───────────────────────────────

  y += gap;
  nodes.push({
    id: "muskelPruefung",
    label: "Bekannter Schmerz durch:",
    subItems: {
      labels: [
        "Mundöffnung [Muskel, U4]",
        "2s Palpation der Kaumuskulatur [Muskel, U9]",
      ],
      connector: "ODER",
    },
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH + 30,
  });

  const leftCol = mainCol - 320;

  transitions.push(
    { from: "muskelPruefung", to: "myalgie", startDirection: "left", endDirection: "down", type: "positive", label: "Ja" },
    // Nein at 2s → goes straight down to 5s palpation (to exclude false negatives)
    { from: "muskelPruefung", to: "spezifizierung", startDirection: "down", endDirection: "down", type: "negative", label: "Nein" },
  );

  // ── 4. Myalgie diagnosis (left of main column) ───────────────────

  y += gap + 10;
  nodes.push({
    id: "myalgie",
    label: "Myalgie",
    color: "blue",
    isEndNode: true,
    diagnosisId: "myalgia",
    center: { x: leftCol, y },
    width: diagnosisW,
    height: diagnosisH,
  });

  // Continue to 5s subtyping
  transitions.push(
    { from: "myalgie", to: "spezifizierung", startDirection: "right", endDirection: "right", type: "unconditional" },
  );

  // ── 5. 5s palpation: subtype differentiation ─────────────────────

  nodes.push({
    id: "spezifizierung",
    label: "Bekannter Schmerz, 5s Palpation der Kaumuskulatur [Muskel, U9]",
    subLabel: "Um Myalgie zu spezifizieren",
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH + 10,
  });

  transitions.push(
    { from: "spezifizierung", to: "ausbreitung", startDirection: "down", endDirection: "down", type: "positive", label: "Ja" },
    { from: "spezifizierung", to: "weitere", startDirection: "right", endDirection: "up", type: "negative", label: "Nein" },
  );

  // ── 6. Spreading beyond palpation site ────────────────────────────

  y += gap;
  nodes.push({
    id: "ausbreitung",
    label: "Schmerzausbreitung jenseits der palpierten Stelle [Muskel, U9]",
    center: { x: mainCol, y },
    width: decisionW,
    height: decisionH,
  });

  if (hasSpreading) {
    // ── 7. Spreading beyond muscle boundaries (temporalis/masseter) ──

    y += gap;
    nodes.push({
      id: "muskelgrenzen",
      label: "Schmerzausbreitung jenseits der Muskelgrenzen [Muskel, U9]",
      center: { x: mainCol, y },
      width: decisionW,
      height: decisionH,
    });

    // Lokale Myalgie (no spreading)
    nodes.push({
      id: "lokaleMyalgie",
      label: "Lokale Myalgie",
      color: "blue",
      isEndNode: true,
      diagnosisId: "localMyalgia",
      center: { x: rightCol, y: y - gap },
      width: diagnosisW,
      height: diagnosisH,
    });

    // Myofaszialer Schmerz (spreading within muscle)
    nodes.push({
      id: "myofaszial",
      label: "Myofaszialer Schmerz",
      color: "blue",
      isEndNode: true,
      diagnosisId: "myofascialPainWithSpreading",
      center: { x: mainCol - 180, y: y + diagGap },
      width: diagnosisW,
      height: diagnosisH,
    });

    // Myofaszialer Schmerz mit Übertragung (beyond muscle)
    nodes.push({
      id: "myofaszialUebertragung",
      label: "Myofaszialer Schmerz mit Übertragung",
      color: "blue",
      isEndNode: true,
      diagnosisId: "myofascialPainWithReferral",
      center: { x: mainCol + 180, y: y + diagGap },
      width: diagnosisW,
      height: diagnosisH,
    });

    transitions.push(
      { from: "ausbreitung", to: "muskelgrenzen", startDirection: "down", endDirection: "down", type: "positive", label: "Ja" },
      { from: "ausbreitung", to: "lokaleMyalgie", startDirection: "right", endDirection: "right", type: "negative", label: "Nein" },
      { from: "muskelgrenzen", to: "myofaszialUebertragung", startDirection: "right", endDirection: "down", type: "positive", label: "Ja" },
      { from: "muskelgrenzen", to: "myofaszial", startDirection: "left", endDirection: "down", type: "negative", label: "Nein" },
    );
  } else {
    // Non-spreading regions: only local vs referral
    nodes.push({
      id: "lokaleMyalgie",
      label: "Lokale Myalgie",
      color: "blue",
      isEndNode: true,
      diagnosisId: "localMyalgia",
      center: { x: mainCol - 180, y: y + diagGap },
      width: diagnosisW,
      height: diagnosisH,
    });

    nodes.push({
      id: "myofaszialUebertragung",
      label: "Myofaszialer Schmerz mit Übertragung",
      color: "blue",
      isEndNode: true,
      diagnosisId: "myofascialPainWithReferral",
      center: { x: mainCol + 180, y: y + diagGap },
      width: diagnosisW,
      height: diagnosisH,
    });

    transitions.push(
      { from: "ausbreitung", to: "myofaszialUebertragung", startDirection: "right", endDirection: "down", type: "positive", label: "Ja" },
      { from: "ausbreitung", to: "lokaleMyalgie", startDirection: "left", endDirection: "down", type: "negative", label: "Nein" },
    );
  }

  return {
    id: `myalgia-combined-${side}-${region}`,
    title: `Myalgie & Subtypen (${regionLabel}, ${sideLabel})`,
    side,
    region,
    nodes,
    transitions,
  };
}
