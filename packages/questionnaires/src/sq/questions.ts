/**
 * DC/TMD Symptom Questionnaire - Question Definitions (German)
 * Source: Diagnostic Criteria for Temporomandibular Disorders - Symptom Questionnaire
 *
 * Questions are flattened so each screen shows one item:
 * - Matrix questions (SQ4, SQ7) are expanded into individual rows
 * - Total screens: 22 (14 base questions, but SQ4 and SQ7 have 4 rows each)
 */
import type { SQQuestion, SQQuestionId } from "../types";
import { SQ_YES_NO_OPTIONS, SQ_PAIN_FREQUENCY_OPTIONS } from "./options";
import { SQ_SECTIONS } from "./sections";

/**
 * All screens in order, with matrix questions expanded
 * Skip logic is attached to relevant questions
 */
export const SQ_SCREENS: SQQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: SCHMERZEN (Pain)
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ1 - Pain ever (always shown)
  {
    id: "SQ1",
    type: "single_choice",
    text: "Hatten Sie jemals Schmerzen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr auf einer Seite?",
    options: SQ_YES_NO_OPTIONS,
  },

  // SQ2 - Pain onset duration (enabled when SQ1 = yes)
  {
    id: "SQ2",
    type: "composite_number",
    text: "Vor wie vielen Jahren oder Monaten begannen Ihre Schmerzen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr zum ersten Mal?",
    fields: {
      years: { id: "SQ2_years", label: "Jahre" },
      months: { id: "SQ2_months", label: "Monate" },
    },
    enableWhen: [{ questionId: "SQ1", operator: "=", value: "yes" }],
  },

  // SQ3 - Pain in last 30 days (enabled when SQ1 = yes)
  {
    id: "SQ3",
    type: "single_choice",
    text: "Welche der folgenden Aussagen beschreibt am besten Schmerzen in den letzten 30 Tagen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr?",
    note: "Bitte wählen Sie EINE Antwort.",
    options: SQ_PAIN_FREQUENCY_OPTIONS,
    enableWhen: [{ questionId: "SQ1", operator: "=", value: "yes" }],
  },

  // SQ4 - Activities affecting pain (Matrix - 4 rows expanded)
  // Enabled when SQ1 = yes AND SQ3 != no_pain
  {
    id: "SQ4_A",
    type: "matrix_row",
    parentId: "SQ4",
    text: "Haben in den letzten 30 Tagen die folgenden Aktivitäten Ihre Schmerzen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr verändert (verbessert oder verschlechtert)?",
    rowText: "Kauen harter oder zäher Nahrung",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_B",
    type: "matrix_row",
    parentId: "SQ4",
    text: "Haben in den letzten 30 Tagen die folgenden Aktivitäten Ihre Schmerzen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr verändert (verbessert oder verschlechtert)?",
    rowText: "Mundöffnung oder Kieferbewegung nach vorne oder zur Seite",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_C",
    type: "matrix_row",
    parentId: "SQ4",
    text: "Haben in den letzten 30 Tagen die folgenden Aktivitäten Ihre Schmerzen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr verändert (verbessert oder verschlechtert)?",
    rowText: "Kiefergewohnheiten wie Zähne zusammenhalten, Zähne pressen/knirschen oder Kaugummi kauen",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_D",
    type: "matrix_row",
    parentId: "SQ4",
    text: "Haben in den letzten 30 Tagen die folgenden Aktivitäten Ihre Schmerzen im Kiefer, an der Schläfe, im Ohr oder vor dem Ohr verändert (verbessert oder verschlechtert)?",
    rowText: "Andere Kieferaktivitäten wie Sprechen, Küssen oder Gähnen",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: KOPFSCHMERZEN (Headache)
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ5 - Temple headache (always shown)
  {
    id: "SQ5",
    type: "single_choice",
    text: "Hatten Sie in den letzten 30 Tagen Kopfschmerzen, die die Schläfenbereiche einschlossen?",
    options: SQ_YES_NO_OPTIONS,
  },

  // SQ6 - Temple headache onset duration (enabled when SQ5 = yes)
  {
    id: "SQ6",
    type: "composite_number",
    text: "Vor wie vielen Jahren oder Monaten begannen Ihre Schläfenkopfschmerzen zum ersten Mal?",
    fields: {
      years: { id: "SQ6_years", label: "Jahre" },
      months: { id: "SQ6_months", label: "Monate" },
    },
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },

  // SQ7 - Activities affecting headache (Matrix - 4 rows expanded)
  // Enabled when SQ5 = yes
  {
    id: "SQ7_A",
    type: "matrix_row",
    parentId: "SQ7",
    text: "Haben in den letzten 30 Tagen die folgenden Aktivitäten Ihre Kopfschmerzen in den Schläfenbereichen verändert (verbessert oder verschlechtert)?",
    rowText: "Kauen harter oder zäher Nahrung",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_B",
    type: "matrix_row",
    parentId: "SQ7",
    text: "Haben in den letzten 30 Tagen die folgenden Aktivitäten Ihre Kopfschmerzen in den Schläfenbereichen verändert (verbessert oder verschlechtert)?",
    rowText: "Mundöffnung oder Kieferbewegung nach vorne oder zur Seite",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_C",
    type: "matrix_row",
    parentId: "SQ7",
    text: "Haben in den letzten 30 Tagen die folgenden Aktivitäten Ihre Kopfschmerzen in den Schläfenbereichen verändert (verbessert oder verschlechtert)?",
    rowText: "Kiefergewohnheiten wie Zähne zusammenhalten, Zähne pressen/knirschen oder Kaugummi kauen",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_D",
    type: "matrix_row",
    parentId: "SQ7",
    text: "Haben in den letzten 30 Tagen die folgenden Aktivitäten Ihre Kopfschmerzen in den Schläfenbereichen verändert (verbessert oder verschlechtert)?",
    rowText: "Andere Kieferaktivitäten wie Sprechen, Küssen oder Gähnen",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: KIEFERGELENKGERÄUSCHE (Jaw Joint Noises)
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ8 - Jaw joint noises
  {
    id: "SQ8",
    type: "single_choice",
    text: "Hatten Sie in den letzten 30 Tagen Kiefergelenkgeräusche bei Bewegung oder Benutzung des Kiefers?",
    options: SQ_YES_NO_OPTIONS,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: KIEFERSPERRE GESCHLOSSEN (Closed Locking)
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ9 - Jaw lock/catch ever (always shown)
  {
    id: "SQ9",
    type: "single_choice",
    text: "Ist Ihr Kiefer jemals blockiert oder eingerastet, sodass er sich nicht VOLLSTÄNDIG öffnen ließ?",
    options: SQ_YES_NO_OPTIONS,
  },

  // SQ10 - Jaw lock severity (enabled when SQ9 = yes)
  {
    id: "SQ10",
    type: "single_choice",
    text: "War die Kiefersperre so stark, dass sie die Mundöffnung einschränkte und das Essen beeinträchtigte?",
    options: SQ_YES_NO_OPTIONS,
    enableWhen: [{ questionId: "SQ9", operator: "=", value: "yes" }],
  },

  // SQ11 - Jaw lock in last 30 days that unlocked (enabled when SQ9 = yes)
  {
    id: "SQ11",
    type: "single_choice",
    text: "Hat sich Ihr Kiefer in den letzten 30 Tagen so blockiert, dass er sich nicht VOLLSTÄNDIG öffnen ließ, selbst für einen Moment, und dann wieder gelöst, sodass er sich VOLLSTÄNDIG öffnen ließ?",
    options: SQ_YES_NO_OPTIONS,
    enableWhen: [{ questionId: "SQ9", operator: "=", value: "yes" }],
  },

  // SQ12 - Currently locked (enabled when SQ9 = yes AND SQ11 = yes)
  {
    id: "SQ12",
    type: "single_choice",
    text: "Ist Ihr Kiefer derzeit blockiert oder eingeschränkt, sodass er sich nicht VOLLSTÄNDIG öffnen lässt?",
    options: SQ_YES_NO_OPTIONS,
    enableWhen: [
      { questionId: "SQ9", operator: "=", value: "yes" },
      { questionId: "SQ11", operator: "=", value: "yes" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: KIEFERSPERRE OFFEN (Open Locking)
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ13 - Open locking in last 30 days (always shown)
  {
    id: "SQ13",
    type: "single_choice",
    text: "Ist Ihr Kiefer in den letzten 30 Tagen bei weiter Mundöffnung blockiert oder eingerastet, selbst für einen Moment, sodass Sie ihn aus dieser weit geöffneten Position nicht schließen konnten?",
    options: SQ_YES_NO_OPTIONS,
  },

  // SQ14 - Needed to do something to close (enabled when SQ13 = yes)
  {
    id: "SQ14",
    type: "single_choice",
    text: "Mussten Sie in den letzten 30 Tagen, als Ihr Kiefer weit offen blockiert war, etwas tun, um ihn zu schließen, einschließlich Ausruhen, Bewegen, Drücken oder Manövrieren?",
    options: SQ_YES_NO_OPTIONS,
    enableWhen: [{ questionId: "SQ13", operator: "=", value: "yes" }],
  },
];

/**
 * Question order for iteration
 */
export const SQ_QUESTION_ORDER: SQQuestionId[] = SQ_SCREENS.map((q) => q.id);

/**
 * Get the index of a question by ID
 */
export function getScreenIndexById(id: SQQuestionId): number {
  return SQ_SCREENS.findIndex((q) => q.id === id);
}

/**
 * Total number of screens in the questionnaire
 */
export const SQ_TOTAL_SCREENS = SQ_SCREENS.length;

/**
 * SQ questionnaire metadata
 */
export const SQ_METADATA = {
  id: "dc-tmd-sq",
  title: "DC/TMD Symptom-Fragebogen",
  version: "1.0",
} as const;

/**
 * Get a question by ID
 */
export function getQuestionById(id: SQQuestionId): SQQuestion | undefined {
  return SQ_SCREENS.find((q) => q.id === id);
}

/**
 * Get section name for a question ID
 */
function getSectionName(questionId: SQQuestionId): string {
  const section = SQ_SECTIONS.find((s) => s.questionIds.includes(questionId));
  return section?.name ?? "";
}

/**
 * Get display text for a question (short form for matrix rows)
 */
function getDisplayText(q: SQQuestion): string {
  if (q.type === "matrix_row") {
    // For matrix rows, combine parent context with row text
    const prefix = q.parentId === "SQ4" ? "Aktivität beeinflusst Schmerzen" : "Aktivität beeinflusst Kopfschmerzen";
    return `${prefix}: ${q.rowText}`;
  }
  return q.text;
}

/**
 * Question labels map (for practitioner display)
 * Derived from SQ_SCREENS to avoid duplication
 */
export const SQ_QUESTION_LABELS: Record<SQQuestionId, { text: string; section: string }> =
  Object.fromEntries(
    SQ_SCREENS.map((q) => [
      q.id,
      { text: getDisplayText(q), section: getSectionName(q.id) },
    ])
  ) as Record<SQQuestionId, { text: string; section: string }>;
