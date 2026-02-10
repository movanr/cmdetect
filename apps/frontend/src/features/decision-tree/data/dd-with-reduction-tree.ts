import {
  and,
  computed,
  DD_WITHOUT_REDUCTION_ANAMNESIS,
  DISC_DISPLACEMENT_WITH_REDUCTION,
  DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING,
  DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING,
  field,
  or,
  sq,
  TMJ_NOISE_ANAMNESIS,
  type Side,
} from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/**
 * DD with Reduction detail tree — Level 2 decision tree.
 *
 * Path:
 * 1. TMJ Noise anamnesis (gateway, same as screening)
 * 2. Click pattern (E6/E7 examination criterion)
 * 3. Intermittent locking check (SQ11 + SQ12)
 * 4. End nodes: DV mit Reposition + intermittierender Kieferklemme / DV mit Reposition
 * 5. Red end node for negative paths
 */
export function createDdWithReductionTree(side: Side): DecisionTreeDef {
  const ctx = { side, region: "tmj" as const };

  // Layout constants
  const colCenter = 200;
  const nodeW = 320;
  const endW = 240;
  const endH = 80;

  // E8 closed-lock criterion: "if not observed → yes, else check reduction"
  const e8ClosedLockReduction = or(
    [
      // Path 1: No locking observed in clinic → default to positive ("else go to Yes")
      field(`e8.${side}.closedLocking.locking`, { equals: "no" }),
      // Path 2: Locking observed AND reduced by maneuver
      and([
        field(`e8.${side}.closedLocking.locking`, { equals: "yes" }),
        field(`e8.${side}.closedLocking.reduction`, { notEquals: "notReduced" }),
      ]),
    ],
    { id: "e8ClosedLockCheck", label: "U8 Geschlossene Blockierung", pendingAs: "positive" }
  );

  // Opening measurement: maxAssisted + verticalOverlap < 40mm
  const openingLimited = computed(
    ["e4.maxAssisted.measurement", "e2.verticalOverlap"],
    (v) =>
      ((v["e4.maxAssisted.measurement"] as number) ?? 0) +
      ((v["e2.verticalOverlap"] as number) ?? 0),
    "<",
    40
  );

  // Intermittent locking criterion: SQ11=yes AND SQ12=no
  const intermittentLocking = and(
    [field(sq("SQ11"), { equals: "yes" }), field(sq("SQ12"), { equals: "no" })],
    { id: "intermittentLockingCheck", label: "Intermittierende Kieferklemme" }
  );

  const nodes: TreeNodeDef[] = [
    // ── Row 1: DD without reduction anamnesis check ──
    {
      id: "ddWithoutReductionCheck",
      label: "DV ohne Reposition — Anamnese",
      subItems: {
        labels: [
          "KG-Blockade mit eingeschränkter Mundöffnung (SF 9)",
          "Einschränkung schwer genug, um die Fähigkeit zu Essen zu beeinträchtigen (SF 10)",
        ],
        connector: "UND",
      },
      criterion: DD_WITHOUT_REDUCTION_ANAMNESIS,
      center: { x: colCenter, y: 70 },
      width: nodeW,
      height: 120,
    },
    // ── Main DV mit Reposition flow (center) ──
    {
      id: "noDdWithReduction",
      label: "Keine DV mit Reposition",
      color: "red",
      isEndNode: true,
      center: { x: colCenter - 300, y: 310 },
      width: 180,
      height: 80,
    },
    {
      id: "noise",
      label: "Anamnese — KG-Geräusch",
      subLabel:
        "Anamnestisch aktuell vorhandenes KG-Geräusch, ODER Patient gibt während der Untersuchung Geräusche an (SF 8, U6/U7)",
      criterion: TMJ_NOISE_ANAMNESIS,
      center: { x: colCenter, y: 310 },
      width: nodeW,
      height: 100,
    },
    // ── DV ohne Reposition branch (right, same row as clicks) ──
    {
      id: "openingMeasurement",
      label: "Untersuchung — Mundöffnung eingeschränkt?",
      subLabel: "Passive Dehnung (max. assistierte Mundöffnung + vertikaler Überbiss) < 40 mm (U4c)",
      criterion: openingLimited,
      context: ctx,
      center: { x: colCenter + 400, y: 470 },
      width: nodeW,
      height: 100,
    },
    {
      id: "clicks",
      label: "Untersuchung",
      subItems: {
        labels: [
          "Knacken beim Öffnen und Schließen (U6)",
          "Knacken beim Öffnen oder Schließen UND Knacken bei Laterotrusion oder Protrusion (U6 und U7)",
        ],
        connector: "ODER",
      },
      criterion: DISC_DISPLACEMENT_WITH_REDUCTION.examination.criterion,
      context: ctx,
      center: { x: colCenter, y: 470 },
      width: nodeW,
      height: 140,
    },
    {
      id: "noLimitedOpening",
      label: "DV ohne Reposition, ohne Mundöffnungseinschränkung",
      color: "blue",
      isEndNode: true,
      criterion: and([
        DD_WITHOUT_REDUCTION_ANAMNESIS,
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_NO_LIMITED_OPENING.examination.criterion,
      ]),
      context: ctx,
      center: { x: colCenter + 550, y: 620 },
      width: endW,
      height: 70,
    },
    {
      id: "intermittentLocking",
      label: "Anamnese — Intermittierende Kieferklemme",
      subLabel:
        "Aktuell intermittierende Blockade mit eingeschränkter Mundöffnung (SF 11 = ja, SF 12 = nein)",
      criterion: intermittentLocking,
      center: { x: colCenter, y: 660 },
      width: nodeW,
      height: 100,
    },
    {
      id: "ddWithReduction",
      label: "DV mit Reposition",
      color: "blue",
      isEndNode: true,
      criterion: and([
        DISC_DISPLACEMENT_WITH_REDUCTION.anamnesis,
        DISC_DISPLACEMENT_WITH_REDUCTION.examination.criterion,
      ]),
      context: ctx,
      center: { x: colCenter - 170, y: 820 },
      width: endW,
      height: endH,
    },
    {
      id: "e8Check",
      label: "Klinische Beobachtung (U8)",
      subLabel: "Wenn klinisch feststellbar: Durch Manöver reponierbar? Sonst: Ja",
      criterion: e8ClosedLockReduction,
      center: { x: colCenter + 200, y: 820 },
      width: 280,
      height: 100,
    },
    {
      id: "ddWithReductionIL",
      label: "DV mit Reposition, mit intermittierender Kieferklemme",
      color: "blue",
      isEndNode: true,
      criterion: and([
        DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING.anamnesis,
        DISC_DISPLACEMENT_WITH_REDUCTION_INTERMITTENT_LOCKING.examination.criterion,
        e8ClosedLockReduction,
      ]),
      context: ctx,
      center: { x: colCenter + 60, y: 980 },
      width: endW,
      height: endH,
    },
    {
      id: "ddWithoutReductionLimited",
      label: "DV ohne Reposition, mit Mundöffnungseinschränkung",
      color: "blue",
      isEndNode: true,
      criterion: and([
        DD_WITHOUT_REDUCTION_ANAMNESIS,
        DISC_DISPLACEMENT_WITHOUT_REDUCTION_LIMITED_OPENING.examination.criterion,
      ]),
      context: ctx,
      center: { x: colCenter + 400, y: 980 },
      width: endW,
      height: endH,
    },
  ];

  const transitions: TransitionFromIds[] = [
    // ── DV ohne Reposition branch (positive → right, then down) ──
    {
      from: "ddWithoutReductionCheck",
      to: "openingMeasurement",
      startDirection: "right",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "openingMeasurement",
      to: "ddWithoutReductionLimited",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "openingMeasurement",
      to: "noLimitedOpening",
      startDirection: "right",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
    // ── DV mit Reposition flow (negative → down) ──
    {
      from: "ddWithoutReductionCheck",
      to: "noise",
      startDirection: "down",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
    {
      from: "noise",
      to: "clicks",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "noise",
      to: "noDdWithReduction",
      startDirection: "left",
      endDirection: "left",
      type: "negative",
      label: "Nein",
    },
    {
      from: "clicks",
      to: "intermittentLocking",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "clicks",
      to: "noDdWithReduction",
      startDirection: "left",
      endDirection: "up",
      type: "negative",
      label: "Nein",
    },
    // ── Intermittent locking → E8 check ──
    {
      from: "intermittentLocking",
      to: "ddWithReduction",
      startDirection: "left",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
    {
      from: "intermittentLocking",
      to: "e8Check",
      startDirection: "right",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "e8Check",
      to: "ddWithReductionIL",
      startDirection: "left",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "e8Check",
      to: "ddWithoutReductionLimited",
      startDirection: "right",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
  ];

  const sideLabel = side === "right" ? "Rechts" : "Links";

  return {
    id: `dd-with-reduction-${side}-tmj`,
    title: `Diskusverlagerung (KG, ${sideLabel})`,
    side,
    region: "tmj",
    nodes,
    transitions,
  };
}
