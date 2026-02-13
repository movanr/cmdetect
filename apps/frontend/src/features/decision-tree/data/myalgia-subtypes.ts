import {
  GROUP_CONFIG,
  LOCAL_MYALGIA_EXAMINATION,
  MYALGIA_ANAMNESIS,
  MYALGIA_EXAMINATION,
  MYOFASCIAL_REFERRAL_EXAMINATION,
  MYOFASCIAL_SPREADING_EXAMINATION,
  REGIONS,
  and,
  any,
  field,
  getSiteRefs,
  sq,
  type Region,
  type Side,
} from "@cmdetect/dc-tmd";
import type { DecisionTreeDef, TransitionFromIds, TreeNodeDef } from "../types";

/** E10 supplemental regions use U10 for palpation source */
const E10_REGIONS: readonly Region[] = ["otherMast", "nonMast"];

/**
 * Generate the myalgia subtypes decision tree for a specific side and region.
 *
 * Assumes myalgia is already confirmed. Differentiates into:
 * - Local Myalgia (no spreading, no referred)
 * - Myofascial Pain with Spreading (spreading, no referred) — only for regions with spreading
 * - Myofascial Pain with Referral (referred present)
 *
 * For supplemental regions (otherMast/nonMast), spreading is not applicable,
 * so the tree skips the spreading node and only differentiates local vs referral.
 */
export function createMyalgiaSubtypesTree(side: Side, region: Region): DecisionTreeDef {
  const ctx = { side, region };
  const hasSpreading = GROUP_CONFIG[region].hasSpreading;
  const palpationSource = E10_REGIONS.includes(region) ? "U10" : "U9";

  // Build palpation criteria using dc-tmd builders
  const familiarPainRefs = getSiteRefs(region, side, "familiarPain");
  const referredPainRefs = getSiteRefs(region, side, "referredPain");

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

  // Full myalgia criterion: anamnesis + examination (region-specific via context)
  const myalgiaCriterion = and([MYALGIA_ANAMNESIS, MYALGIA_EXAMINATION.criterion], {
    id: "myalgiaFull",
    label: "Myalgie (Anamnese + Untersuchung)",
  });

  const regionTitle = REGIONS[region];
  const sideTitle = side === "right" ? "Rechts" : "Links";

  // Layout
  const colCenter = 200;
  const nodeW = 300;
  const nodeH = 110;
  const endW = 220;
  const endH = 110;

  // For regions without spreading, use a simplified tree layout
  if (!hasSpreading) {
    const nodes: TreeNodeDef[] = [
      {
        id: "myalgia",
        label: "Myalgie",
        color: "blue",
        isEndNode: true,
        diagnosisId: "myalgia",
        criterion: myalgiaCriterion,
        context: ctx,
        center: { x: colCenter, y: 55 },
        width: 200,
        height: endH,
      },
      {
        id: "familiarPain",
        label: "Bekannter Schmerz bei Palpation",
        sources: [palpationSource],
        criterion: familiarPainPalpation,
        context: ctx,
        center: { x: colCenter, y: 210 },
        width: nodeW,
        height: nodeH,
      },
      {
        id: "referredPain",
        label: "Übertragener Schmerz bei Palpation",
        sources: [palpationSource],
        criterion: referredPainPalpation,
        context: ctx,
        center: { x: colCenter, y: 365 },
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
        center: { x: colCenter - 140, y: 520 },
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
        center: { x: colCenter + 310, y: 365 },
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
        center: { x: colCenter + 310, y: 210 },
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
        to: "localMyalgia",
        startDirection: "down",
        endDirection: "down",
        type: "negative",
        label: "Nein",
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

  // Full tree with spreading for temporalis/masseter
  const spreadingPainRefs = getSiteRefs(region, side, "spreadingPain");
  const spreadingPainPalpation = any(
    spreadingPainRefs,
    { equals: "yes" },
    {
      id: "spreadingPainPalpation",
      label: "Ausbreitender Schmerz bei Palpation",
    }
  );

  const nodes: TreeNodeDef[] = [
    {
      id: "myalgia",
      label: "Myalgie",
      color: "blue",
      isEndNode: true,
      diagnosisId: "myalgia",
      criterion: myalgiaCriterion,
      context: ctx,
      center: { x: colCenter, y: 55 },
      width: 200,
      height: endH,
    },
    {
      id: "familiarPain",
      label: "Bekannter Schmerz bei Palpation",
      sources: [palpationSource],
      criterion: familiarPainPalpation,
      context: ctx,
      center: { x: colCenter, y: 210 },
      width: nodeW,
      height: nodeH,
    },
    {
      id: "referredPain",
      label: "Übertragener Schmerz bei Palpation",
      sources: [palpationSource],
      criterion: referredPainPalpation,
      context: ctx,
      center: { x: colCenter, y: 365 },
      width: nodeW,
      height: nodeH,
    },
    {
      id: "spreadingPain",
      label: "Ausbreitender Schmerz bei Palpation",
      sources: [palpationSource],
      criterion: spreadingPainPalpation,
      context: ctx,
      center: { x: colCenter, y: 520 },
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
      center: { x: colCenter - 182, y: 675 },
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
      center: { x: colCenter + 192, y: 675 },
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
      center: { x: colCenter + 310, y: 520 },
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
      center: { x: colCenter + 310, y: 210 },
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
