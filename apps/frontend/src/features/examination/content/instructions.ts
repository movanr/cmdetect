/**
 * Clinical instructions for DC-TMD examination sections.
 * German language for clinical use.
 *
 * These are concise instructions for examiners - not tutorial text.
 * Patient scripts are quotable prompts for communication.
 */

import type { PalpationMode } from "@cmdetect/dc-tmd";
import type {
  ProcedureFlowStep,
  RichMeasurementInstruction,
  RichPainInterviewInstruction,
  SafetyWarning,
} from "./types";

/** Instruction content for a single examination step (legacy) */
export interface StepInstruction {
  /** Step identifier (e.g., "E4A", "E4B") */
  stepId: string;
  /** Step title */
  title: string;
  /** Patient communication script (quotable) */
  patientScript: string;
  /** Key examiner action */
  examinerAction: string;
}

/** Pain interview guidance content (legacy) */
export interface PainInterviewInstruction {
  /** Title for the pain interview step */
  title: string;
  /** Patient prompt for pointing to pain areas */
  prompt: string;
  /** Abbreviated flow guidance */
  guidance: string;
}

// ============================================================================
// E4C Safety Warning
// ============================================================================

/** Safety warning for assisted opening */
const E4C_SAFETY_WARNING: SafetyWarning = {
  message: "Bei Handheben des Patienten sofort stoppen",
  level: "caution",
};

// ============================================================================
// Pain Interview Flow Definition
// ============================================================================

/**
 * Pain interview for movement-induced pain (E4B - unassisted opening).
 *
 * 5-step procedure from DC-TMD protocol sections 6.2.1 + 6.2.4 (section 8.2):
 * 1. Ask if patient had pain during movement (6.2.1)
 * 2. Patient localizes pain by pointing with finger (6.2.1)
 * 3. Examiner touches area to confirm location and identify anatomical structure
 * 4. Familiar pain inquiry — verbatim scripts from 6.2.4
 * 5. Ask if there are other pain areas (6.2.1)
 *
 * NOTE: Referred pain inquiry (6.2.5) is NOT part of movement-induced pain — only for palpation.
 */
const E4B_PAIN_INTERVIEW_FLOW: ProcedureFlowStep[] = [
  {
    id: "pain",
    label: "Schmerz bei Bewegung?",
    patientScript: "Hatten Sie bei dieser Bewegung Schmerzen?",
    figureRef: "13",
  },
  {
    id: "locate",
    label: "Lokalisation",
    patientScript:
      "Können Sie mit Ihrem Finger auf alle Bereiche zeigen, in denen Sie bei dieser Bewegung Schmerzen gespürt haben?",
    figureRef: "2",
  },
  {
    id: "confirm",
    label: "Bestätigung",
    examinerInstruction:
      "Bereich berühren und anatomische Struktur identifizieren",
    figureRef: "3",
    appAction: "Region im Diagramm wählen",
  },
  {
    id: "familiar",
    label: "Bekannter Schmerz",
    patientScript:
      "Ist dieser Schmerz Ihnen bekannt von Schmerzen, die Sie in diesem Bereich in den letzten 30 Tagen erfahren haben?",
    examinerInstruction:
      `Bei Temporalis-Lokalisation zusätzlich: „Ist dieser Schmerz Ihnen bekannt von Kopfschmerzen, die Sie in diesem Bereich in den letzten 30 Tagen hatten?"`,
    appAction: "Schmerztypen eingeben",
  },
  {
    id: "done",
    label: "Weitere Bereiche?",
    patientScript:
      "Gibt es noch weitere Bereiche, in denen Sie bei dieser Bewegung Schmerzen gespürt haben?",
    appAction: 'Button „Keine weiteren Schmerzbereiche"',
  },
];

/**
 * Pain interview for examiner-assisted opening (E4C).
 *
 * Uses a different pain question that specifically asks about pain from
 * the examiner's manipulation, not from the patient's movement.
 *
 * This distinction is important for differential diagnosis per DC-TMD protocol.
 */
const E4C_PAIN_INTERVIEW_FLOW: ProcedureFlowStep[] = [
  {
    id: "pain",
    label: "Schmerz bei Manipulation?",
    patientScript:
      "Hatten Sie Schmerzen, als ich versucht habe, Ihren Mund mit meinen Fingern weiter zu öffnen?",
    figureRef: "16",
  },
  {
    id: "locate",
    label: "Lokalisation",
    patientScript:
      "Können Sie mit Ihrem Finger auf alle Bereiche zeigen, in denen Sie Schmerzen gespürt haben?",
    figureRef: "2",
  },
  {
    id: "confirm",
    label: "Bestätigung",
    examinerInstruction:
      "Bereich berühren und anatomische Struktur identifizieren",
    figureRef: "3",
    appAction: "Region im Diagramm wählen",
  },
  {
    id: "familiar",
    label: "Bekannter Schmerz",
    patientScript:
      "Ist dieser Schmerz Ihnen bekannt von Schmerzen, die Sie in diesem Bereich in den letzten 30 Tagen erfahren haben?",
    examinerInstruction:
      `Bei Temporalis-Lokalisation zusätzlich: „Ist dieser Schmerz Ihnen bekannt von Kopfschmerzen, die Sie in diesem Bereich in den letzten 30 Tagen hatten?"`,
    appAction: "Schmerztypen eingeben",
  },
  {
    id: "done",
    label: "Weitere Bereiche?",
    patientScript:
      "Gibt es noch weitere Bereiche, in denen Sie Schmerzen gespürt haben, als ich Ihren Mund weiter geöffnet habe?",
    appAction: 'Button „Keine weiteren Schmerzbereiche"',
  },
];

// ============================================================================
// E4 Measurement Flows (Step-based procedures)
// ============================================================================

/**
 * E4A - Pain-free opening measurement flow.
 * Based on DC-TMD protocol section 5 (detailed) and section 4.5 (quick reference).
 */
const E4A_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "script",
    label: "Anweisung",
    patientScript:
      "Ich möchte, dass Sie Ihren Mund so weit wie möglich öffnen, ohne Schmerzen zu verspüren oder bestehende Schmerzen zu verstärken. Ich werde Ihnen sagen, wann Sie schließen können.",
  },
  {
    id: "ruler",
    label: "Lineal anlegen",
    examinerInstruction: "0-Marke an Inzisalkante des unteren Referenzzahns anlegen.",
  },
  {
    id: "measure",
    label: "Messen",
    examinerInstruction: "Interinzisale Distanz ablesen.",
    figureRef: "11",
    appAction: "Messwert in mm eingeben",
  },
];

/**
 * E4B - Maximum unassisted opening measurement flow.
 * Same technique as E4A but patient opens maximally despite pain.
 * Based on DC-TMD protocol section 7.
 */
const E4B_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "script",
    label: "Anweisung",
    patientScript:
      "Ich möchte, dass Sie Ihren Mund so weit wie möglich öffnen, auch wenn es schmerzhaft ist. Ich werde Ihnen sagen, wann Sie schließen können.",
  },
  {
    id: "ruler",
    label: "Lineal anlegen",
    examinerInstruction: "0-Marke an Inzisalkante des unteren Referenzzahns anlegen.",
  },
  {
    id: "measure",
    label: "Messen",
    examinerInstruction: "Interinzisale Distanz ablesen.",
    figureRef: "12",
    appAction: "Messwert in mm eingeben",
  },
];

/**
 * E4C - Maximum assisted opening measurement flow.
 * Scissor technique with safety warning.
 *
 * Based on DC-TMD protocol section 8 with exact quotations:
 * 1. Announcement with hand-raise instruction
 * 2. Ruler placement
 * 3. Patient opens maximally
 * 4. Tactile warning before finger contact
 * 5. Relaxation prompt (critical for scissor technique)
 * 6. Scissor technique application
 * 7. Measurement
 */
const E4C_MEASUREMENT_FLOW: ProcedureFlowStep[] = [
  {
    id: "announce",
    label: "Ankündigung",
    patientScript:
      "Gleich werde ich versuchen, Ihren Mund mit meinen Fingern weiter zu öffnen. Wenn Sie möchten, dass ich aufhöre, heben Sie Ihre Hand und ich werde sofort aufhören.",
  },
  {
    id: "ruler",
    label: "Lineal platzieren",
    patientScript: "Ich werde mein Lineal platzieren.",
    examinerInstruction: "0-Marke an Inzisalkante des unteren Referenzzahns anlegen.",
    pause: true,
  },
  {
    id: "open",
    label: "Patient öffnet",
    patientScript:
      "Jetzt öffnen Sie Ihren Mund so weit wie möglich, auch wenn schmerzhaft, genau wie zuvor.",
    pause: true,
  },
  {
    id: "tactile-warning",
    label: "Berührungsankündigung",
    patientScript: "Sie werden meine Finger spüren.",
  },
  {
    id: "relax",
    label: "Entspannung",
    patientScript:
      "Bitte entspannen Sie Ihren Kiefer, damit ich Ihnen helfen kann, weiter zu öffnen, wenn möglich.",
    pause: true,
  },
  {
    id: "technique",
    label: "Scherentechnik",
    examinerInstruction:
      "Daumen auf obere, Zeigefinger auf untere Schneidezähne. Mäßigen Druck anwenden bis Gewebswiderstand.",
    figureRef: "15",
  },
  {
    id: "measure",
    label: "Messen",
    examinerInstruction: "Interinzisale Distanz ablesen.",
    appAction: "Messwert in mm eingeben",
  },
];

// ============================================================================
// E4 Rich Instructions
// ============================================================================

/**
 * E4 Opening Movements - Rich Clinical Instructions
 *
 * Based on DC-TMD Examiner Protocol Section 4
 */
export const E4_RICH_INSTRUCTIONS = {
  /** U4A - Pain-free opening (step-based flow) */
  painFreeOpening: {
    stepId: "U4A",
    title: "Schmerzfreie Mundöffnung",
    flow: E4A_MEASUREMENT_FLOW,
    protocolRefs: [
      { section: "section2", anchor: "25", label: "2.5 Messungen und Bewegungen" },
      { section: "section4", anchor: "u4-offnungsbewegungen", label: "4.5 U4 Öffnungsbewegungen" },
      { section: "e4", anchor: "4a-schmerzfreie-offnung", label: "5.4 U4A Schmerzfreie Öffnung" },
      { section: "section8", anchor: "83", label: "8.3 Untersuchungsanweisungen" },
    ],
  } satisfies RichMeasurementInstruction,

  /** U4B - Maximum unassisted opening (step-based flow) */
  maxUnassistedOpening: {
    stepId: "U4B",
    title: "Maximale aktive Mundöffnung",
    flow: E4B_MEASUREMENT_FLOW,
    protocolRefs: [
      { section: "section2", anchor: "25", label: "2.5 Messungen und Bewegungen" },
      { section: "section4", anchor: "u4-offnungsbewegungen", label: "4.5 U4 Öffnungsbewegungen" },
      { section: "e4", anchor: "4b-maximale-nicht-unterstutzte-offnung", label: "5.4 U4B Max. nicht-unterstützte Öffnung" },
      { section: "section8", anchor: "83", label: "8.3 Untersuchungsanweisungen" },
    ],
  } satisfies RichMeasurementInstruction,

  /** U4C - Maximum assisted opening (step-based flow with safety warning) */
  maxAssistedOpening: {
    stepId: "U4C",
    title: "Maximale passive Mundöffnung",
    flow: E4C_MEASUREMENT_FLOW,
    warnings: [E4C_SAFETY_WARNING],
    protocolRefs: [
      { section: "section2", anchor: "25", label: "2.5 Messungen und Bewegungen" },
      { section: "section4", anchor: "u4-offnungsbewegungen", label: "4.5 U4 Öffnungsbewegungen" },
      { section: "e4", anchor: "4c-maximale-unterstutzte-offnung", label: "5.4 U4C Max. unterstützte Öffnung" },
      { section: "section8", anchor: "83", label: "8.3 Untersuchungsanweisungen" },
    ],
  } satisfies RichMeasurementInstruction,

  /** Pain interview after E4B (unassisted opening) */
  painInterview: {
    title: "Schmerzbefragung",
    prompt: "Hatten Sie bei dieser Bewegung Schmerzen?",
    flow: E4B_PAIN_INTERVIEW_FLOW,
    protocolRefs: [
      { section: "section2", anchor: "26", label: "2.6 Klassifikation anatomischer Strukturen" },
      { section: "section2", anchor: "29", label: "2.9 Bekannter Schmerz" },
      { section: "section4", anchor: "u4-offnungsbewegungen", label: "4.5 U4 Öffnungsbewegungen" },
      { section: "e4", anchor: "u4b-schmerz-nach-maximaler-nicht-unterstutzter-offnung", label: "5.4 Schmerzbefragung U4B" },
      { section: "section6", anchor: "62", label: "6.2 Strukturierte Schmerzbefragung" },
      { section: "section8", anchor: "82", label: "8.2 Untersuchungsbezogene Schmerzbefragung" },
    ],
  } satisfies RichPainInterviewInstruction,

  /** Pain interview after E4C (assisted opening) - uses examiner manipulation wording */
  painInterviewAssistedOpening: {
    title: "Schmerzbefragung",
    prompt:
      "Hatten Sie Schmerzen, als ich versucht habe, Ihren Mund mit meinen Fingern weiter zu öffnen?",
    flow: E4C_PAIN_INTERVIEW_FLOW,
    protocolRefs: [
      { section: "section2", anchor: "26", label: "2.6 Klassifikation anatomischer Strukturen" },
      { section: "section2", anchor: "29", label: "2.9 Bekannter Schmerz" },
      { section: "section4", anchor: "u4-offnungsbewegungen", label: "4.5 U4 Öffnungsbewegungen" },
      { section: "e4", anchor: "u4c-schmerz-nach-maximaler-unterstutzter-offnung", label: "5.4 Schmerzbefragung U4C" },
      { section: "section6", anchor: "62", label: "6.2 Strukturierte Schmerzbefragung" },
      { section: "section8", anchor: "82", label: "8.2 Untersuchungsbezogene Schmerzbefragung" },
    ],
  } satisfies RichPainInterviewInstruction,
} as const;

// ============================================================================
// Legacy E4 Instructions (for backwards compatibility)
// ============================================================================

/**
 * E4 Opening Movements - Clinical Instructions (Legacy format)
 *
 * Based on DC-TMD Examiner Protocol Section 4
 */
export const E4_INSTRUCTIONS = {
  /** E4A - Pain-free opening */
  painFreeOpening: {
    stepId: "U4A",
    title: "Schmerzfreie Mundöffnung",
    patientScript:
      "Öffnen Sie Ihren Mund so weit wie möglich, ohne dadurch Schmerzen auszulösen oder bestehende Schmerzen zu verstärken.",
    examinerAction: "Interinzisale Distanz messen",
  } satisfies StepInstruction,

  /** E4B - Maximum unassisted opening */
  maxUnassistedOpening: {
    stepId: "U4B",
    title: "Maximale aktive Mundöffnung",
    patientScript: "Öffnen Sie Ihren Mund so weit wie möglich, auch wenn es schmerzhaft ist.",
    examinerAction: "Interinzisale Distanz messen",
  } satisfies StepInstruction,

  /** E4C - Maximum assisted opening */
  maxAssistedOpening: {
    stepId: "U4C",
    title: "Maximale passive Mundöffnung",
    patientScript:
      "Ich werde jetzt versuchen, Ihren Mund weiter zu öffnen. Heben Sie die Hand, wenn Sie möchten, dass ich aufhöre.",
    examinerAction: "Scherentechnik anwenden, Distanz messen",
  } satisfies StepInstruction,

  /** Pain interview after movement */
  painInterview: {
    title: "Schmerzbefragung",
    prompt: "Hatten Sie bei dieser Bewegung Schmerzen?",
    guidance: "Schmerz → Lokalisation → Bestätigung → Keine weiteren Schmerzbereiche",
  } satisfies PainInterviewInstruction,
} as const;

// ============================================================================
// E1 Pain/Headache Location Interview Flows
// ============================================================================

/**
 * E1A - Pain location flow (5 steps).
 * Based on DC-TMD protocol section 5.3 U1a.
 */
const E1A_PAIN_LOCATION_FLOW: ProcedureFlowStep[] = [
  {
    id: "scope",
    label: "Bereiche zeigen",
    examinerInstruction:
      "Beidseits gleichzeitig berühren: Temporalis, Kiefergelenk, Masseter, retromandibulär/submandibulär",
    patientScript:
      "Für die Zwecke dieser Untersuchung interessiere ich mich für Schmerzen, die Sie möglicherweise in diesen Bereichen haben…",
    figureRef: "1",
  },
  {
    id: "pain-question",
    label: "Schmerzfrage",
    patientScript: "Hatten Sie in den letzten 30 Tagen Schmerzen in diesen Bereichen?",
  },
  {
    id: "locate",
    label: "Lokalisation",
    patientScript:
      "Können Sie mit Ihrem Finger auf alle Bereiche zeigen, in denen Sie Schmerzen gespürt haben?",
    figureRef: "2",
    pause: true,
  },
  {
    id: "confirm",
    label: "Bestätigung",
    examinerInstruction:
      'Betroffene Bereiche berühren zur Bestätigung, „hier?" fragen',
    figureRef: "3",
    appAction: "Region im Diagramm wählen",
  },
  {
    id: "more",
    label: "Weitere Bereiche?",
    patientScript:
      "Gibt es noch weitere Bereiche, in denen Sie Schmerzen gespürt haben?",
  },
];

/**
 * E1B - Headache location flow (4 steps).
 * Based on DC-TMD protocol section 5.3 U1b.
 */
const E1B_HEADACHE_LOCATION_FLOW: ProcedureFlowStep[] = [
  {
    id: "headache-question",
    label: "Kopfschmerzfrage",
    patientScript: "Hatten Sie in den letzten 30 Tagen Kopfschmerzen?",
  },
  {
    id: "locate",
    label: "Lokalisation",
    patientScript:
      "Können Sie mit Ihrem Finger auf alle Bereiche zeigen, in denen Sie Kopfschmerzen gespürt haben?",
    pause: true,
  },
  {
    id: "confirm",
    label: "Bestätigung",
    examinerInstruction:
      'Betroffene Bereiche berühren zur Bestätigung, „hier?" fragen',
    appAction: "Temporalis-Region im Diagramm wählen",
  },
  {
    id: "more",
    label: "Weitere Bereiche?",
    patientScript:
      "Gibt es noch weitere Bereiche, in denen Sie Kopfschmerzen gespürt haben?",
  },
];

// ============================================================================
// E1 Rich Instructions
// ============================================================================

/**
 * E1 Pain/Headache Location - Rich Clinical Instructions
 *
 * Based on DC-TMD Examiner Protocol Section 5.3 (U1)
 */
export const E1_RICH_INSTRUCTIONS = {
  /** U1A - Pain location in the last 30 days */
  painLocation: {
    title: "Schmerzlokalisation",
    prompt: "Hatten Sie in den letzten 30 Tagen Schmerzen in diesen Bereichen?",
    flow: E1A_PAIN_LOCATION_FLOW,
    protocolRefs: [
      { section: "section2", anchor: "26", label: "2.6 Klassifikation anatomischer Strukturen" },
      { section: "section4", anchor: "u1-untersucherbestatigung-der-schmerz-und-kopfschmerzlokalisationen", label: "4.5 U1 Schmerzlokalisation" },
      { section: "e1", anchor: "lokalisation-von-schmerzen-innerhalb-den-letzten-30-tagen", label: "5.3 U1A Schmerzlokalisation" },
      { section: "section8", anchor: "83", label: "8.3 Untersuchungsanweisungen" },
    ],
  } satisfies RichPainInterviewInstruction,

  /** U1B - Headache location in the last 30 days */
  headacheLocation: {
    title: "Kopfschmerzlokalisation",
    prompt: "Hatten Sie in den letzten 30 Tagen Kopfschmerzen?",
    flow: E1B_HEADACHE_LOCATION_FLOW,
    protocolRefs: [
      { section: "section4", anchor: "u1-untersucherbestatigung-der-schmerz-und-kopfschmerzlokalisationen", label: "4.5 U1 Schmerzlokalisation" },
      { section: "e1", anchor: "u1b-kopfschmerzlokalisation-wahrend-der-letzten-30-tage", label: "5.3 U1B Kopfschmerzlokalisation" },
      { section: "section8", anchor: "83", label: "8.3 Untersuchungsanweisungen" },
    ],
  } satisfies RichPainInterviewInstruction,
} as const;

// ============================================================================
// E2 Incisal Relationships Measurement Flows
// ============================================================================

/**
 * E2 - Reference tooth and marking flow (3 steps).
 * Based on DC-TMD protocol section 5.3 U2.
 */
const E2_REFERENCE_TOOTH_FLOW: ProcedureFlowStep[] = [
  {
    id: "marking",
    label: "Markierung",
    patientScript:
      "Ich werde einige Bleistiftmarkierungen auf Ihren Zähnen anbringen; ich werde sie am Ende der Untersuchung entfernen.",
    examinerInstruction: "Referenzzähne im OK und UK auswählen (typisch 11/21)",
    figureRef: "4",
  },
  {
    id: "close",
    label: "Zubeißen",
    patientScript: "Bitte legen Sie Ihre Backenzähne vollständig aufeinander.",
    pause: true,
  },
  {
    id: "mark-line",
    label: "Referenzlinie",
    examinerInstruction:
      "Horizontale Linie auf UK-Schneidezahn markieren, wo OK-Kante den UK überlappt",
    appAction: "Referenzzahn dokumentieren",
  },
];

/**
 * E2 - Midline deviation flow (2 steps).
 * Based on DC-TMD protocol section 5.3 U2.
 */
const E2_MIDLINE_FLOW: ProcedureFlowStep[] = [
  {
    id: "assess",
    label: "Mittellinie prüfen",
    examinerInstruction:
      "Dentale Mittellinien OK/UK vergleichen. < 1mm = keine Abweichung (0 mm)",
    figureRef: ["5a", "5b"],
  },
  {
    id: "measure",
    label: "Abweichung messen",
    examinerInstruction: "Bei >= 1mm: Richtung und Betrag notieren",
    figureRef: "6",
    appAction: "Richtung und mm-Wert eingeben",
  },
];

/**
 * E2 - Horizontal overjet flow (2 steps).
 * Based on DC-TMD protocol section 5.3 U2.
 */
const E2_OVERJET_FLOW: ProcedureFlowStep[] = [
  {
    id: "close",
    label: "Zubeißen",
    patientScript: "Bitte legen Sie Ihre Backenzähne vollständig aufeinander.",
    pause: true,
  },
  {
    id: "measure",
    label: "Messen",
    examinerInstruction: "Horizontalen Abstand von labial OK zu labial UK messen",
    figureRef: "7",
    appAction: "Messwert in mm eingeben (negativ bei Kreuzbiss)",
  },
];

/**
 * E2 - Vertical overlap flow (2 steps).
 * Based on DC-TMD protocol section 5.3 U2.
 */
const E2_OVERLAP_FLOW: ProcedureFlowStep[] = [
  {
    id: "open",
    label: "Öffnen",
    examinerInstruction: "Patient auffordern, ausreichend zu öffnen für Messung",
    pause: true,
  },
  {
    id: "measure",
    label: "Messen",
    examinerInstruction: "Vertikalen Überbiss an der Markierung messen",
    figureRef: "8",
    appAction: "Messwert in mm eingeben (negativ bei offenem Biss)",
  },
];

// ============================================================================
// E2 Rich Instructions
// ============================================================================

/**
 * E2 Incisal Relationships - Rich Clinical Instructions
 *
 * Based on DC-TMD Examiner Protocol Section 5.3 (U2)
 */
export const E2_RICH_INSTRUCTIONS = {
  /** Reference tooth and marking */
  referenceTooth: {
    stepId: "U2-ref",
    title: "Referenzzahn & Markierungen",
    flow: E2_REFERENCE_TOOTH_FLOW,
    protocolRefs: [
      { section: "section4", anchor: "u2-schneidekantenverhaltnisse", label: "4.5 U2 Schneidekantenverhältnisse" },
      { section: "e2", anchor: "wahlen-sie-referenzzahne-im-ober-und-unterkiefer-aus", label: "5.3 U2 Referenzzähne" },
    ],
  } satisfies RichMeasurementInstruction,

  /** Midline deviation */
  midlineDeviation: {
    stepId: "U2-mid",
    title: "Mittellinienabweichung",
    flow: E2_MIDLINE_FLOW,
    protocolRefs: [
      { section: "section4", anchor: "u2-schneidekantenverhaltnisse", label: "4.5 U2 Schneidekantenverhältnisse" },
      { section: "e2", anchor: "referenzlinie-referenz-mittellinie-im-unterkiefer", label: "5.3 U2 Mittellinie" },
    ],
  } satisfies RichMeasurementInstruction,

  /** Horizontal overjet */
  horizontalOverjet: {
    stepId: "U2-hov",
    title: "Horizontaler Overjet",
    flow: E2_OVERJET_FLOW,
    protocolRefs: [
      { section: "section4", anchor: "u2-schneidekantenverhaltnisse", label: "4.5 U2 Schneidekantenverhältnisse" },
      { section: "e2", anchor: "horizontaler-inzisaler-uberbiss", label: "5.3 U2 Horizontaler Overjet" },
    ],
  } satisfies RichMeasurementInstruction,

  /** Vertical overlap */
  verticalOverlap: {
    stepId: "U2-vov",
    title: "Vertikaler Overlap",
    flow: E2_OVERLAP_FLOW,
    protocolRefs: [
      { section: "section4", anchor: "u2-schneidekantenverhaltnisse", label: "4.5 U2 Schneidekantenverhältnisse" },
      { section: "e2", anchor: "vertikaler-inzisaler-uberbiss", label: "5.3 U2 Vertikaler Überbiss" },
    ],
  } satisfies RichMeasurementInstruction,
} as const;

// ============================================================================
// E3 Opening Pattern Flow
// ============================================================================

/**
 * E3 - Opening pattern observation flow (4 steps).
 * Based on DC-TMD protocol section 5.3 U3.
 */
const E3_OPENING_PATTERN_FLOW: ProcedureFlowStep[] = [
  {
    id: "start",
    label: "Ausgangsposition",
    patientScript: "Bitte legen Sie Ihre Backenzähne vollständig aufeinander.",
    pause: true,
  },
  {
    id: "instruction",
    label: "Anweisung",
    patientScript:
      "Ich möchte, dass Sie langsam Ihren Mund so weit wie möglich öffnen, auch wenn es schmerzhaft ist, schließen und Ihre Backenzähne wieder vollständig aufeinander legen.",
    figureRef: ["9", "10a"],
  },
  {
    id: "observe",
    label: "Beobachten",
    examinerInstruction:
      "Öffnungsbewegung beobachten: Gerade (< 2mm), korrigiert (>= 2mm mit Rückkehr), unkorrigiert (>= 2mm ohne Rückkehr)",
    figureRef: "10b",
  },
  {
    id: "repeat",
    label: "Wiederholen",
    patientScript: "Noch zweimal wiederholen.",
    examinerInstruction: "Insgesamt 3x beobachten",
    appAction: "Muster auswählen",
  },
];

// ============================================================================
// E3 Rich Instructions
// ============================================================================

/**
 * E3 Opening Pattern - Rich Clinical Instructions
 *
 * Based on DC-TMD Examiner Protocol Section 5.3 (U3)
 */
export const E3_RICH_INSTRUCTIONS = {
  /** Opening pattern observation */
  openingPattern: {
    stepId: "U3",
    title: "Öffnungsmuster",
    flow: E3_OPENING_PATTERN_FLOW,
    protocolRefs: [
      { section: "section4", anchor: "u3-offnungsmuster-erganzend", label: "4.5 U3 Öffnungsmuster" },
      { section: "e3", anchor: "offnungsmuster", label: "5.3 U3 Öffnungsmuster" },
      { section: "section8", anchor: "83", label: "8.3 Untersuchungsanweisungen" },
    ],
  } satisfies RichMeasurementInstruction,
} as const;

// ============================================================================
// E9 Palpation Flows (mode-aware)
// ============================================================================

/** Duration in seconds for palpation, by mode */
function durationSek(mode: PalpationMode): string {
  return mode === "basic" ? "2" : "5";
}

/** Duration label for patient script, by mode */
function durationLabel(mode: PalpationMode): string {
  return mode === "basic" ? "2 Sekunden" : "5 Sekunden";
}

/** Build the examiner inquiry chain for a palpation step (abbreviated prompts per 5.9/8.2) */
function buildInquiryChain(mode: PalpationMode, hasHeadache: boolean): string {
  const parts = ["Schmerz?", "Bekannter Schmerz?"];
  if (hasHeadache) parts.push("Bekannter Kopfschmerz?");
  if (mode !== "basic") parts.push("Nur unter meinem Finger?");
  return parts.join(" → ");
}

/** Build the appAction hint for the basic inquiry (pain/familiar only) */
function buildInquiryAppAction(hasHeadache: boolean): string {
  const parts = ["Schmerz", "bekannter Schmerz"];
  if (hasHeadache) parts.push("Kopfschmerz");
  return parts.join(", ") + " eingeben";
}

/**
 * Build the referred/spreading pain classification step (6.2.5).
 * Only included in standard mode. After the abbreviated prompt "Nur unter meinem Finger?",
 * a negative answer triggers localization and examiner classification.
 */
function buildReferredPainStep(hasSpreading: boolean): ProcedureFlowStep {
  return {
    id: "referred",
    label: "Schmerzausbreitung",
    condition: "Falls nicht nur unter dem Finger",
    patientScript:
      "Zeigen Sie mit Ihrem Finger auf alle Bereiche, in denen Sie gerade Schmerzen gespürt haben.",
    examinerInstruction: hasSpreading
      ? "Jenseits der Muskelgrenze = übertragener Schmerz. Innerhalb des Muskels = ausbreitender Schmerz."
      : "Jenseits des Gelenks = übertragener Schmerz.",
    appAction: hasSpreading
      ? "übertragener/ausbreitender Schmerz eingeben"
      : "übertragener Schmerz eingeben",
  };
}

/**
 * E9 - Palpation introduction flow (4-5 steps depending on mode).
 * Based on DC-TMD protocol section 5.9 / 8.2.
 * In basic mode, the "referred pain" explanation step is omitted
 * and the abbreviated prompts step omits "nur unter meinem Finger?".
 */
function createE9IntroductionFlow(mode: PalpationMode): ProcedureFlowStep[] {
  const steps: ProcedureFlowStep[] = [
    {
      id: "intro",
      label: "Einführung",
      patientScript:
        "Jetzt werde ich Druck auf verschiedene Bereiche Ihres Kopfes, Gesichts und Kiefers ausüben, und ich werde Sie nach Schmerzen, bekanntem Schmerz und bekanntem Kopfschmerz fragen.",
      figureRef: "24",
    },
  ];
  // Only include referred pain explanation for standard mode
  if (mode !== "basic") {
    steps.push({
      id: "referred",
      label: "Übertragener Schmerz",
      patientScript:
        "Außerdem werde ich fragen, ob der Schmerz nur unter meinem Finger bleibt oder ob Sie ihn auch irgendwo anders außer unter meinem Finger spüren.",
    });
  }
  // Abbreviated prompts — establishes the shorthand vocabulary with the patient (5.9/8.2)
  steps.push({
    id: "prompts",
    label: "Kurzabfrage",
    patientScript: mode === "basic"
      ? `Ich werde Sie mit den Worten „Schmerz", „bekannter Schmerz" und „bekannter Kopfschmerz" auffordern.`
      : `Ich werde Sie mit den Worten „Schmerz", „bekannter Schmerz", „bekannter Kopfschmerz" und „nur unter meinem Finger?" auffordern.`,
  });
  steps.push(
    {
      id: "duration",
      label: "Dauer",
      patientScript: `Jedes Mal werde ich Druck ausüben und ihn ${durationLabel(mode)} lang halten.`,
    },
    {
      id: "calibrate",
      label: "Kalibrierung",
      examinerInstruction: "Mit Finger-Algometer auf 1,0 kg kalibrieren",
      figureRef: "25",
    },
  );
  return steps;
}

/**
 * E9 - Temporalis palpation flow (4-5 steps depending on mode).
 * Based on DC-TMD protocol section 5.9.
 * Standard mode adds a referred/spreading pain classification step (6.2.5).
 * Temporalis: hasHeadache=true, hasSpreading=true
 */
function createE9TemporalisFlow(mode: PalpationMode): ProcedureFlowStep[] {
  const steps: ProcedureFlowStep[] = [
    {
      id: "identify",
      label: "Muskelgrenzen",
      patientScript: "Bitte beißen Sie kurz zusammen.",
      examinerInstruction: "Muskelgrenzen durch Anspannung identifizieren",
      pause: true,
    },
    {
      id: "relax",
      label: "Entspannung",
      patientScript: "Bitte entspannen Sie Ihren Kiefer.",
      pause: true,
    },
    {
      id: "palpate",
      label: "Palpieren",
      examinerInstruction: `3 vertikale Zonen (anterior, Mitte, posterior). 1 kg, ${durationSek(mode)} Sek/Zone`,
      figureRef: ["26", "27"],
    },
    {
      id: "inquiry",
      label: "Befragung",
      examinerInstruction: buildInquiryChain(mode, true),
      appAction: buildInquiryAppAction(true),
    },
  ];
  if (mode !== "basic") steps.push(buildReferredPainStep(true));
  return steps;
}

/**
 * E9 - Masseter palpation flow (2-3 steps depending on mode).
 * Based on DC-TMD protocol section 5.9.
 * Standard mode adds a referred/spreading pain classification step (6.2.5).
 * Masseter: hasHeadache=false, hasSpreading=true
 */
function createE9MasseterFlow(mode: PalpationMode): ProcedureFlowStep[] {
  const steps: ProcedureFlowStep[] = [
    {
      id: "palpate",
      label: "Palpieren",
      examinerInstruction: `3 horizontale Bänder (Ursprung, Körper, Ansatz). 1 kg, ${durationSek(mode)} Sek/Band`,
      figureRef: ["28", "29"],
    },
    {
      id: "inquiry",
      label: "Befragung",
      examinerInstruction: buildInquiryChain(mode, false),
      appAction: buildInquiryAppAction(false),
    },
  ];
  if (mode !== "basic") steps.push(buildReferredPainStep(true));
  return steps;
}

/**
 * E9 - TMJ lateral pole palpation flow (4-5 steps depending on mode).
 * Based on DC-TMD protocol section 5.9.
 * Pain interview per 6.2.2 → 6.2.4 [→ 6.2.5] (section 8.2).
 * Standard mode adds a referred pain classification step (6.2.5).
 * TMJ: hasHeadache=false, hasSpreading=false
 */
function createE9TmjLateralPoleFlow(mode: PalpationMode): ProcedureFlowStep[] {
  const steps: ProcedureFlowStep[] = [
    {
      id: "calibrate",
      label: "Kalibrierung",
      examinerInstruction: "Auf 0,5 kg kalibrieren",
      figureRef: "33",
    },
    {
      id: "protrude",
      label: "Protrusion",
      patientScript:
        "Bitte öffnen Sie leicht, schieben Sie Ihren Unterkiefer nach vorn und bewegen Sie dann Ihren Kiefer wieder zurück in seine normale Position ohne, dass Ihre Zähne sich berühren.",
      figureRef: ["31", "32"],
      pause: true,
    },
    {
      id: "palpate",
      label: "Palpieren",
      examinerInstruction: `Zeigefinger anterior des Tragus auf lateralem Pol. 0,5 kg, ${durationSek(mode)} Sek.`,
      figureRef: "33",
    },
    {
      id: "inquiry",
      label: "Befragung",
      examinerInstruction: buildInquiryChain(mode, false),
      appAction: buildInquiryAppAction(false),
    },
  ];
  if (mode !== "basic") steps.push(buildReferredPainStep(false));
  return steps;
}

/**
 * E9 - TMJ around lateral pole palpation flow (4-5 steps depending on mode).
 * Based on DC-TMD protocol section 5.9.
 * Pain interview per 6.2.2 → 6.2.4 [→ 6.2.5] (section 8.2).
 * Standard mode adds a referred pain classification step (6.2.5).
 * TMJ: hasHeadache=false, hasSpreading=false
 */
function createE9TmjAroundPoleFlow(mode: PalpationMode): ProcedureFlowStep[] {
  const steps: ProcedureFlowStep[] = [
    {
      id: "calibrate",
      label: "Kalibrierung",
      examinerInstruction: "Auf 1,0 kg kalibrieren",
      figureRef: "36",
    },
    {
      id: "protrude-hold",
      label: "Protrusion halten",
      patientScript:
        "Bitte öffnen Sie den Mund leicht, schieben Sie den Unterkiefer ein wenig nach vorn und halten Sie ihn dort.",
      figureRef: ["34", "35"],
      pause: true,
    },
    {
      id: "palpate-around",
      label: "Um Pol palpieren",
      examinerInstruction: `Finger um lateralen Kondylenpol rollen. 1 kg, zirkuläre Bewegung, ~${durationSek(mode)} Sek.`,
      figureRef: "36",
    },
    {
      id: "inquiry",
      label: "Befragung",
      examinerInstruction: buildInquiryChain(mode, false),
      appAction: buildInquiryAppAction(false),
    },
  ];
  if (mode !== "basic") steps.push(buildReferredPainStep(false));
  return steps;
}

// ============================================================================
// E9 Rich Instructions
// ============================================================================

/** Return type for createE9RichInstructions */
export interface E9RichInstructions {
  introduction: RichMeasurementInstruction;
  temporalisPalpation: RichPainInterviewInstruction;
  masseterPalpation: RichPainInterviewInstruction;
  tmjLateralPole: RichMeasurementInstruction;
  tmjAroundPole: RichMeasurementInstruction;
}

/**
 * E9 Palpation - Rich Clinical Instructions (mode-aware)
 *
 * Based on DC-TMD Examiner Protocol Section 5.9 (U9)
 * Instructions adapt to the selected palpation mode:
 * - basic: 2 Sek. duration, no referred/spreading pain
 * - standard: 5 Sek. duration, includes referred + spreading pain
 */
export function createE9RichInstructions(mode: PalpationMode): E9RichInstructions {
  return {
    introduction: {
      stepId: "U9-intro",
      title: "Einführung Palpation",
      flow: createE9IntroductionFlow(mode),
      protocolRefs: [
        { section: "section4", anchor: "u9-muskel-und-kiefergelenkschmerz-bei-palpation", label: "4.5 U9 Palpation" },
        { section: "e9", anchor: "allgemeine-instruktionen", label: "5.9 Allgemeine Instruktionen" },
        { section: "section8", anchor: "622", label: "6.2.2 Palpationsschmerz" },
        { section: "section8", anchor: "83", label: "8.3 Untersuchungsanweisungen" },
      ],
    },
    temporalisPalpation: {
      title: "Temporalis-Palpation",
      prompt: "Hatten Sie Schmerzen?",
      flow: createE9TemporalisFlow(mode),
      protocolRefs: [
        { section: "section4", anchor: "u9-muskel-und-kiefergelenkschmerz-bei-palpation", label: "4.5 U9 Palpation" },
        { section: "e9", anchor: "m-temporalis-und-m-masseter", label: "5.9 Temporalis & Masseter" },
        { section: "section8", anchor: "624", label: "6.2.4 Bekannter Schmerz" },
        { section: "section8", anchor: "625", label: "6.2.5 Übertragener Schmerz" },
      ],
    },
    masseterPalpation: {
      title: "Masseter-Palpation",
      prompt: "Hatten Sie Schmerzen?",
      flow: createE9MasseterFlow(mode),
      protocolRefs: [
        { section: "section4", anchor: "u9-muskel-und-kiefergelenkschmerz-bei-palpation", label: "4.5 U9 Palpation" },
        { section: "e9", anchor: "m-temporalis-und-m-masseter", label: "5.9 Temporalis & Masseter" },
      ],
    },
    tmjLateralPole: {
      stepId: "U9-lat",
      title: "Lateraler Kondylenpol",
      flow: createE9TmjLateralPoleFlow(mode),
      protocolRefs: [
        { section: "section4", anchor: "u9-muskel-und-kiefergelenkschmerz-bei-palpation", label: "4.5 U9 Palpation" },
        { section: "e9", anchor: "lateraler-kondylenpol", label: "5.9 Lateraler Kondylenpol" },
      ],
    },
    tmjAroundPole: {
      stepId: "U9-around",
      title: "Um den lateralen Kondylenpol",
      flow: createE9TmjAroundPoleFlow(mode),
      protocolRefs: [
        { section: "section4", anchor: "u9-muskel-und-kiefergelenkschmerz-bei-palpation", label: "4.5 U9 Palpation" },
        { section: "e9", anchor: "um-den-lateralen-kondylenpol", label: "5.9 Um den lateralen Kondylenpol" },
      ],
    },
  };
}

/** Backward-compatible default (standard mode = current hardcoded "5 Sek" behavior) */
export const E9_RICH_INSTRUCTIONS = createE9RichInstructions("standard");

// ============================================================================
// Type Guards and Helpers
// ============================================================================

/**
 * Check if an instruction is a pain interview instruction
 */
export function isPainInterviewInstruction(
  instruction: unknown
): instruction is RichPainInterviewInstruction {
  return (
    typeof instruction === "object" &&
    instruction !== null &&
    "prompt" in instruction &&
    "flow" in instruction
  );
}
