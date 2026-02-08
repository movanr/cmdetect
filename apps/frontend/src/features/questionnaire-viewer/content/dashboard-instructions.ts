/**
 * Dashboard introductory instructions for Axis 1 and Axis 2 sections.
 *
 * Based on the DC/TMD Scoring Manual for Self-Report Instruments.
 * These provide practitioners with clinical context when first viewing
 * the questionnaire overview dashboard.
 */

/** Source reference linking to a documentation page */
export interface SourceRef {
  /** Route path (e.g., "/docs/scoring-manual") */
  to: string;
  /** Optional heading anchor within the page */
  anchor?: string;
  /** Display label for the link */
  label: string;
}

export interface DashboardAxisInfo {
  title: string;
  items: string[];
  /** Link to the source document in the protocol viewer */
  source?: SourceRef;
}

/**
 * Axis 1 — Symptom Questionnaire introduction.
 *
 * Key message: the SQ requires a follow-up interview and is not a
 * self-complete instrument.
 */
export const AXIS1_INFO: DashboardAxisInfo = {
  title: "Hinweise zum Symptomfragebogen",
  items: [
    "Der Symptomfragebogen ist kein Selbstausfüllbogen und erfordert eine Nachbesprechung zur Klärung und Bestätigung aller Antworten mit dem Patienten.",
    "Die Abschnitte zu Gelenkgeräuschen und Kieferblockaden benötigen zusätzlich eine Seitenzuordnung (rechts/links/beidseitig), die nur durch das Interview bestimmt werden kann.",
    "Die bestätigten Antworten fließen in die diagnostischen Algorithmen der DC/TMD ein.",
  ],
  source: {
    to: "/docs/scoring-manual",
    anchor: "dctmd-symptom-questionnaire",
    label: "Scoring Manual: DC/TMD Symptom Questionnaire",
  },
};

/**
 * Maps questionnaire IDs to scoring manual heading anchors.
 * Used by score cards to link to the relevant manual section.
 */
export const SCORING_MANUAL_ANCHORS: Record<string, string> = {
  "dc-tmd-sq": "dctmd-symptom-questionnaire",
  "dc-tmd-pain-drawing": "pain-drawing",
  "gcps-1m": "gcps-graded-chronic-pain-scale",
  "jfls-8": "jfls-jaw-functional-limitation-scale",
  "jfls-20": "jfls-jaw-functional-limitation-scale",
  "phq-4": "phq-4-distress-depression-anxiety",
  "obc": "obc-oral-behaviors-checklist",
};

/**
 * Axis 2 — Psychosocial assessment introduction.
 *
 * Key message: these are screeners with known limitations; scores must
 * be interpreted in context.
 */
export const AXIS2_INFO: DashboardAxisInfo = {
  title: "Hinweise zur psychosozialen Bewertung",
  items: [
    "Die Achse-2-Instrumente sind Screening-Werkzeuge. Falsch positive und falsch negative Ergebnisse kommen vor.",
    "Bereits ein \u201Eschwerer\u201C Score oder zwei \u201Eleichte\u201C Scores über mehrere Instrumente hinweg können auf ein Problem hinweisen.",
    "Die Skalenwerte müssen im Kontext der individuellen Patientengeschichte interpretiert werden.",
  ],
  source: {
    to: "/docs/scoring-manual",
    anchor: "general-interpretation",
    label: "Scoring Manual: General Interpretation",
  },
};
