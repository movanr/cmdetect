import {
  LOCAL_MYALGIA_EXAMINATION,
  MYALGIA_ANAMNESIS,
  MYALGIA_EXAMINATION,
  MYOFASCIAL_REFERRAL_EXAMINATION,
  MYOFASCIAL_SPREADING_EXAMINATION,
  and,
  any,
  field,
  getSiteRefs,
  sq,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/**
 * Generate the myalgia subtypes decision tree for a specific side and region.
 *
 * Assumes myalgia is already confirmed. Differentiates into:
 * - Local Myalgia (no spreading, no referred)
 * - Myofascial Pain with Spreading (spreading, no referred)
 * - Myofascial Pain with Referral (referred present)
 *
 * Palpation criteria are E9-only (5-second standard palpation).
 */
export function createMyalgiaSubtypesTree(side: Side, region: Region): DecisionTreeDef {
  const ctx = { side, region };

  // Build palpation criteria using dc-tmd builders
  const familiarPainRefs = getSiteRefs(region, side, "familiarPain");
  const referredPainRefs = getSiteRefs(region, side, "referredPain");
  const spreadingPainRefs = getSiteRefs(region, side, "spreadingPain");

  const familiarPainPalpation = any(
    familiarPainRefs,
    { equals: "yes" },
    {
      id: "familiarPainPalpation",
      label: "Bekannter Schmerz bei Palpation",
    }
  );

  const referredPainPalpation = any(
    referredPainRefs,
    { equals: "yes" },
    {
      id: "referredPainPalpation",
      label: "Übertragener Schmerz bei Palpation",
    }
  );

  const spreadingPainPalpation = any(
    spreadingPainRefs,
    { equals: "yes" },
    {
      id: "spreadingPainPalpation",
      label: "Ausbreitender Schmerz bei Palpation",
    }
  );

  // Full myalgia criterion: anamnesis + examination (region-specific via context)
  const myalgiaCriterion = and([MYALGIA_ANAMNESIS, MYALGIA_EXAMINATION.criterion], {
    id: "myalgiaFull",
    label: "Myalgie (Anamnese + Untersuchung)",
  });

  const regionTitle = region === "temporalis" ? "Temporalis" : "Masseter";
  const sideTitle = side === "right" ? "Rechts" : "Links";

  // Layout
  const colCenter = 200;
  const nodeW = 280;
  const nodeH = 90;
  const endW = 220;
  const endH = 70;

  const nodes: TreeNodeDef[] = [
    {
      id: "myalgia",
      label: "Myalgie",
      color: "blue",
      criterion: myalgiaCriterion,
      context: ctx,
      center: { x: colCenter, y: 45 },
      width: 200,
      height: 80,
    },
    {
      id: "familiarPain",
      label: "Bekannter Schmerz bei Palpation",
      criterion: familiarPainPalpation,
      context: ctx,
      center: { x: colCenter, y: 175 },
      width: nodeW,
      height: nodeH,
    },
    {
      id: "referredPain",
      label: "Übertragener Schmerz bei Palpation",
      criterion: referredPainPalpation,
      context: ctx,
      center: { x: colCenter, y: 310 },
      width: nodeW,
      height: nodeH,
    },
    {
      id: "spreadingPain",
      label: "Ausbreitender Schmerz bei Palpation",
      criterion: spreadingPainPalpation,
      context: ctx,
      center: { x: colCenter, y: 450 },
      width: nodeW,
      height: nodeH,
    },
    {
      id: "localMyalgia",
      label: "Lokale Myalgie",
      color: "blue",
      isEndNode: true,
      diagnosisId: "localMyalgia",
      criterion: and([MYALGIA_ANAMNESIS, LOCAL_MYALGIA_EXAMINATION.criterion]),
      context: ctx,
      center: { x: colCenter - 150, y: 580 },
      width: endW,
      height: endH,
    },
    {
      id: "myofascialSpreading",
      label: "Myofaszialer Schmerz",
      color: "blue",
      isEndNode: true,
      diagnosisId: "myofascialPainWithSpreading",
      criterion: and([MYALGIA_ANAMNESIS, MYOFASCIAL_SPREADING_EXAMINATION.criterion]),
      context: ctx,
      center: { x: colCenter + 160, y: 580 },
      width: endW,
      height: endH,
    },
    {
      id: "myofascialReferral",
      label: "Myofaszialer Schmerz mit Übertragung",
      color: "blue",
      isEndNode: true,
      diagnosisId: "myofascialPainWithReferral",
      criterion: and([MYALGIA_ANAMNESIS, MYOFASCIAL_REFERRAL_EXAMINATION.criterion]),
      context: ctx,
      center: { x: colCenter + 310, y: 450 },
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
      center: { x: colCenter + 310, y: 175 },
      width: 180,
      height: 80,
    },
  ];

  const transitions: TransitionFromIds[] = [
    {
      from: "myalgia",
      to: "familiarPain",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "myalgia",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
    {
      from: "familiarPain",
      to: "referredPain",
      startDirection: "down",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "familiarPain",
      to: "investigateOther",
      startDirection: "right",
      endDirection: "right",
      type: "negative",
      label: "Nein",
    },
    {
      from: "referredPain",
      to: "myofascialReferral",
      startDirection: "right",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
    {
      from: "referredPain",
      to: "spreadingPain",
      startDirection: "down",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
    {
      from: "spreadingPain",
      to: "localMyalgia",
      startDirection: "left",
      endDirection: "down",
      type: "negative",
      label: "Nein",
    },
    {
      from: "spreadingPain",
      to: "myofascialSpreading",
      startDirection: "right",
      endDirection: "down",
      type: "positive",
      label: "Ja",
    },
  ];

  return {
    id: `myalgia-subtypes-${side}-${region}`,
    title: `Myalgie-Subtypen (${regionTitle}, ${sideTitle})`,
    side,
    region,
    nodes,
    transitions,
  };
}
