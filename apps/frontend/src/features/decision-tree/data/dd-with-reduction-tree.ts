/**
 * Disc Displacement Decision Tree (combined with/without reduction)
 *
 * Matches the official DC/TMD diagnostic flowchart:
 * "Intra-articuläre Dysfunktionen und Degenerative Dysfunktionen"
 *
 * Top entry: previous locking history (SF9+SF10)
 *   Ja → MPMO check (without-reduction path)
 *   Nein → intra-articular entry (with-reduction path)
 *
 * With-reduction path: SF8/U6/U7 → clicks → locking → maneuver
 * Maneuver Nein also merges into MPMO check.
 *
 * Labels use exact German wordings from the official flowchart.
 */

import type { Side } from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

export function createDdWithReductionTree(side: Side): DecisionTreeDef {
  const sideLabel = side === "right" ? "Rechts" : "Links";

  // Layout: main column (left), MPMO + diagnoses (right)
  const mainCol = 220;
  const rightCol = 600;
  const leftCol = -100;
  const decisionW = 340;
  const diagnosisW = 260;
  const diagnosisH = 100;
  const redW = 200;
  const redH = 80;

  const nodes: TreeNodeDef[] = [];
  const transitions: TransitionFromIds[] = [];

  // ═══════════════════════════════════════════════════════════════════
  // TOP ENTRY: Previous locking history
  // ═══════════════════════════════════════════════════════════════════

  nodes.push({
    id: "entryKieferklemme",
    isEntryNode: true,
    label:
      "Vorrausgehende Kieferklemme [SF9] UND Störungen beim Kauen [SF10]",
    center: { x: mainCol, y: 60 },
    width: decisionW,
    height: 100,
  });

  // ── Red end node ──────────────────────────────────────────────────

  nodes.push({
    id: "weitere",
    label: "Weitere Diagnosen untersuchen",
    color: "red",
    isEndNode: true,
    center: { x: leftCol, y: 220 },
    width: redW,
    height: redH,
  });

  transitions.push(
    {
      from: "entryKieferklemme",
      to: "entryIntra",
      startDirection: "down",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
    {
      from: "entryKieferklemme",
      to: "mpmo",
      startDirection: "right",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
  );

  // ═══════════════════════════════════════════════════════════════════
  // INTRA-ARTICULAR PATHWAY (main column)
  // ═══════════════════════════════════════════════════════════════════

  // ── Entry: TMJ noise anamnesis ────────────────────────────────────

  nodes.push({
    id: "entryIntra",
    label: "",
    subItems: {
      labels: [
        "Aktuelle gelenkbezogene Diagnose (anamnestisch) [SF8]",
        "Angabe von Kiefergelenkgeräuschen durch den Pat. während Untersuchung [U6 ODER U7]",
      ],
      connector: "ODER",
    },
    center: { x: mainCol, y: 220 },
    width: decisionW,
    height: 130,
  });

  transitions.push(
    {
      from: "entryIntra",
      to: "knacken",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "entryIntra",
      to: "weitere",
      startDirection: "left",
      endDirection: "left",
      type: "negative",
      label: "Nein",
    },
  );

  // ── Click pattern check ───────────────────────────────────────────

  nodes.push({
    id: "knacken",
    label: "",
    subItems: {
      labels: [
        "Öffnungs- und Schließknacken [U6]",
        "Öffnungs- oder Schließknacken [U6] UND Exkursives o. protrusives Knacken [U7]",
      ],
      connector: "ODER",
    },
    center: { x: mainCol, y: 400 },
    width: decisionW,
    height: 140,
  });

  transitions.push(
    {
      from: "knacken",
      to: "intermittierend",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "knacken",
      to: "weitere",
      startDirection: "left",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  );

  // ── Intermittent locking check ────────────────────────────────────

  nodes.push({
    id: "intermittierend",
    label:
      "Aktuell intermittierende Kieferklemmen mit Mundöffnungseinschränkung [SF11=ja, SF12=nein]",
    center: { x: mainCol, y: 580 },
    width: decisionW,
    height: 100,
  });

  transitions.push(
    {
      from: "intermittierend",
      to: "maneuver",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "intermittierend",
      to: "dvMitRep",
      startDirection: "left",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
  );

  // ── Maneuver reducibility check ───────────────────────────────────

  nodes.push({
    id: "maneuver",
    label:
      "Wenn klinisch feststellbar: Durch Maneuver reponierbar? [U8], sonst \"Ja\"",
    center: { x: mainCol, y: 720 },
    width: decisionW,
    height: 100,
  });

  transitions.push(
    {
      from: "maneuver",
      to: "dvMitRepIK",
      startDirection: "left",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "maneuver",
      to: "dvOhneRepMitMOE",
      startDirection: "right",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
  );

  // ═══════════════════════════════════════════════════════════════════
  // MPMO CHECK (right column, merge point)
  // ═══════════════════════════════════════════════════════════════════

  nodes.push({
    id: "mpmo",
    label: "MPMÖ ≥ 40mm (inkl. Overbite) [U4C]",
    center: { x: rightCol + 40, y: 600 },
    width: decisionW,
    height: 100,
  });

  transitions.push(
    {
      from: "mpmo",
      to: "dvOhneRepMitMOE",
      startDirection: "left",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
    {
      from: "mpmo",
      to: "dvOhneRepOhneMOE",
      startDirection: "right",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
  );

  // ═══════════════════════════════════════════════════════════════════
  // DIAGNOSIS END NODES
  // ═══════════════════════════════════════════════════════════════════

  nodes.push({
    id: "dvMitRep",
    label: "Diskusverlagerung mit Reposition",
    color: "blue",
    isEndNode: true,
    diagnosisId: "discDisplacementWithReduction",
    imagingNote: "MRT",
    center: { x: leftCol, y: 640 },
    width: diagnosisW,
    height: 80,
  });

  nodes.push({
    id: "dvMitRepIK",
    label: "Diskusverlagerung mit Reposition mit intermittierender Kieferklemme",
    color: "blue",
    isEndNode: true,
    diagnosisId: "discDisplacementWithReductionIntermittentLocking",
    imagingNote: "MRT",
    center: { x: leftCol, y: 810 },
    width: diagnosisW,
    height: diagnosisH,
  });

  nodes.push({
    id: "dvOhneRepMitMOE",
    label: "Diskusverlagerung ohne Reposition, mit Mundöffnungseinschränkung",
    color: "blue",
    isEndNode: true,
    diagnosisId: "discDisplacementWithoutReductionLimitedOpening",
    imagingNote: "MRT",
    center: { x: 440, y: 840 },
    width: diagnosisW,
    height: diagnosisH,
  });

  nodes.push({
    id: "dvOhneRepOhneMOE",
    label: "Diskusverlagerung ohne Reposition, ohne Mundöffnungseinschränkung",
    color: "blue",
    isEndNode: true,
    diagnosisId: "discDisplacementWithoutReductionWithoutLimitedOpening",
    imagingNote: "MRT",
    center: { x: 840, y: 840 },
    width: diagnosisW,
    height: diagnosisH,
  });

  return {
    id: `dd-with-reduction-${side}-tmj`,
    title: `Diskusverlagerung (${sideLabel})`,
    side,
    region: "tmj",
    nodes,
    transitions,
  };
}
