import { field, sq, SUBLUXATION_ANAMNESIS, SUBLUXATION_SIDED_ANAMNESIS, type Side } from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/**
 * Subluxation decision tree — purely anamnesis-based.
 *
 * Path:
 * 1. SQ13: Jaw locks/catches in wide-open position
 * 2. SQ14: Unable to close without special maneuver
 * 3. Sided anamnesis: SQ13 + SQ14 side gate
 * 4. End: Subluxation (blue) or negative (red)
 *
 * Note: E8 (open locking) is optional clinical documentation per DC/TMD.
 * It does not influence the diagnosis — subluxation depends entirely on
 * anamnesis. Even if locking is resolved during examination, the diagnosis
 * remains. Therefore E8 is intentionally excluded from this tree.
 */
export function createSubluxationTree(side: Side): DecisionTreeDef {
  const ctx = { side, region: "tmj" as const };
  const sideLabel = side === "right" ? "Rechts" : "Links";

  // Layout constants
  const colCenter = 200;
  const nodeW = 320;
  const endW = 200;
  const endH = 80;

  const nodes: TreeNodeDef[] = [
    {
      id: "sq13",
      label: "Anamnese — Blockade in geöffneter Position",
      subLabel: "Kiefer fängt oder blockiert bei weit geöffnetem Mund (SF 13)",
      criterion: field(sq("SQ13"), { equals: "yes" }),
      center: { x: colCenter, y: 60 },
      width: nodeW,
      height: 100,
    },
    {
      id: "sq14",
      label: "Anamnese — Mund nicht schließbar",
      subLabel: "Unfähigkeit, den Mund ohne ein spezielles Manöver zu schließen (SF 14)",
      criterion: field(sq("SQ14"), { equals: "yes" }),
      center: { x: colCenter, y: 210 },
      width: nodeW,
      height: 100,
    },
    {
      id: "subluxationSided",
      label: `Seitenangabe — Subluxation (${sideLabel})`,
      subLabel: "Subluxation auf dieser Seite (SF 13 + SF 14 Seitenangabe)",
      criterion: SUBLUXATION_SIDED_ANAMNESIS,
      context: ctx,
      center: { x: colCenter, y: 360 },
      width: nodeW,
      height: 100,
    },
    {
      id: "subluxation",
      label: "Subluxation",
      color: "blue",
      isEndNode: true,
      diagnosisId: "subluxation",
      criterion: SUBLUXATION_ANAMNESIS,
      center: { x: colCenter, y: 520 },
      width: endW,
      height: endH,
    },
    {
      id: "noSubluxation",
      label: "Weitere Diagnosen untersuchen",
      negativeLabel: `Keine Blockade in geöffneter Position angegeben (KG, ${sideLabel})`,
      color: "red",
      isEndNode: true,
      criterion: field(sq("SQ13"), { equals: "yes" }),
      center: { x: colCenter + 350, y: 60 },
      width: endW,
      height: endH,
    },
  ];

  const transitions: TransitionFromIds[] = [
    {
      from: "sq13",
      to: "sq14",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "sq13",
      to: "noSubluxation",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
    {
      from: "sq14",
      to: "subluxationSided",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "sq14",
      to: "noSubluxation",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
    {
      from: "subluxationSided",
      to: "subluxation",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "subluxationSided",
      to: "noSubluxation",
      startDirection: "right",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
  ];

  return {
    id: `subluxation-${side}-tmj`,
    title: `Subluxation (KG, ${sideLabel})`,
    side,
    region: "tmj",
    nodes,
    transitions,
  };
}
