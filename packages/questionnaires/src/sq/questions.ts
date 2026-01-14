/**
 * DC/TMD Symptom Questionnaire - Question Definitions (German)
 * Source: Diagnostic Criteria for Temporomandibular Disorders - Symptom Questionnaire
 *
 * Questions are flattened so each screen shows one item:
 * - Matrix questions (SQ4, SQ7) are expanded into individual rows
 * - Total screens: 22 (14 base questions, but SQ4 and SQ7 have 4 rows each)
 */
import { QUESTIONNAIRE_ID } from "..";
import type { SQQuestion, SQQuestionId } from "../types";
import { SQ_PAIN_FREQUENCY_OPTIONS, SQ_YES_NO_OPTIONS } from "./options";
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
    text: "Hatten Sie jemals auf einer oder beiden Seiten Schmerzen im Kiefer, im Schläfenbereich, im Ohr oder vor dem Ohr?",
    options: SQ_YES_NO_OPTIONS,
  },

  // SQ2 - Pain onset duration (enabled when SQ1 = yes)
  {
    id: "SQ2",
    type: "composite_number",
    text: "Vor wie vielen Jahren oder Monaten hat Ihr Schmerz im Kiefer, den Schläfen, im oder vor dem Ohr erstmals begonnen?",
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
    text: "Welche der folgenden Antworten beschreibt die Schmerzen im Kiefer, Schläfenbereich, im Ohr oder vor dem Ohr auf beiden Seiten in den letzten 30 Tagen am besten?",
    note: "Wählen Sie EINE Antwort.",
    options: SQ_PAIN_FREQUENCY_OPTIONS,
    enableWhen: [{ questionId: "SQ1", operator: "=", value: "yes" }],
  },

  // SQ4 - Activities affecting pain (Matrix - 4 rows expanded)
  // Enabled when SQ1 = yes AND SQ3 != no_pain
  {
    id: "SQ4_A",
    type: "matrix_row",
    parentId: "SQ4",
    text: "Haben die folgenden Aktivitäten in den letzten 30 Tagen einen Schmerz im Kiefer oder im Schläfenbereich, im Ohr oder vor dem Ohr, auf einer oder beiden Seiten verändert (d. h. verbessert bzw. verschlechtert)?",
    rowText: "Kauen von harter oder zäher Nahrung",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_B",
    type: "matrix_row",
    parentId: "SQ4",
    text: "Haben die folgenden Aktivitäten in den letzten 30 Tagen einen Schmerz im Kiefer oder im Schläfenbereich, im Ohr oder vor dem Ohr, auf einer oder beiden Seiten verändert (d. h. verbessert bzw. verschlechtert)?",
    rowText: "Öffnung des Mundes oder Bewegung des Kiefers nach vorn oder zur Seite",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_C",
    type: "matrix_row",
    parentId: "SQ4",
    text: "Haben die folgenden Aktivitäten in den letzten 30 Tagen einen Schmerz im Kiefer oder im Schläfenbereich, im Ohr oder vor dem Ohr, auf einer oder beiden Seiten verändert (d. h. verbessert bzw. verschlechtert)?",
    rowText:
      "Angewohnheiten wie Zähne aufeinander halten, Pressen/Knirschen mit den Zähnen oder Kaugummikauen",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_D",
    type: "matrix_row",
    parentId: "SQ4",
    text: "Haben die folgenden Aktivitäten in den letzten 30 Tagen einen Schmerz im Kiefer oder im Schläfenbereich, im Ohr oder vor dem Ohr, auf einer oder beiden Seiten verändert (d. h. verbessert bzw. verschlechtert)?",
    rowText: "Andere Aktivitäten wie Reden, Küssen oder Gähnen",
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
    text: "Hatten Sie in den letzten 30 Tagen Kopfschmerzen im Schläfenbereich?",
    options: SQ_YES_NO_OPTIONS,
  },

  // SQ6 - Temple headache onset duration (enabled when SQ5 = yes)
  {
    id: "SQ6",
    type: "composite_number",
    text: "Vor wie vielen Jahren oder Monaten trat Ihr Schläfenkopfschmerz erstmals auf?",
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
    text: "Haben die folgenden Aktivitäten in den letzten 30 Tagen einen Schläfenkopfschmerz auf einer oder beiden Seiten verändert (d.h. verbessert bzw. verschlechtert)?",
    rowText: "Kauen von harter oder zäher Nahrung",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_B",
    type: "matrix_row",
    parentId: "SQ7",
    text: "Haben die folgenden Aktivitäten in den letzten 30 Tagen einen Schläfenkopfschmerz auf einer oder beiden Seiten verändert (d.h. verbessert bzw. verschlechtert)?",
    rowText: "Öffnung des Mundes oder Bewegung des Kiefers nach vorn oder zur Seite",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_C",
    type: "matrix_row",
    parentId: "SQ7",
    text: "Haben die folgenden Aktivitäten in den letzten 30 Tagen einen Schläfenkopfschmerz auf einer oder beiden Seiten verändert (d.h. verbessert bzw. verschlechtert)?",
    rowText:
      "Angewohnheiten wie Zähne aufeinander halten, Pressen/Knirschen mit den Zähnen oder Kaugummikauen",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_D",
    type: "matrix_row",
    parentId: "SQ7",
    text: "Haben die folgenden Aktivitäten in den letzten 30 Tagen einen Schläfenkopfschmerz auf einer oder beiden Seiten verändert (d.h. verbessert bzw. verschlechtert)?",
    rowText: "Andere Aktivitäten wie Reden, Küssen oder Gähnen",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: KIEFERGELENKGERÄUSCHE (Jaw Joint Noises)
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ8 - Jaw joint noises
  {
    id: "SQ8",
    type: "single_choice",
    text: "Hatten Sie in den letzten 30 Tagen Gelenkgeräusche, wenn Sie Ihren Kiefer bewegt oder benutzt haben?",
    options: SQ_YES_NO_OPTIONS,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: KIEFERSPERRE GESCHLOSSEN (Closed Locking)
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ9 - Jaw lock/catch ever (always shown)
  {
    id: "SQ9",
    type: "single_choice",
    text: "War Ihre Mundöffnung jemals, auch nur für einen Moment blockiert, sodass sich der Unterkiefer nicht VOLLSTÄNDIG öffnen ließ?",
    options: SQ_YES_NO_OPTIONS,
  },

  // SQ10 - Jaw lock severity (enabled when SQ9 = yes)
  {
    id: "SQ10",
    type: "single_choice",
    text: "War die Blockade Ihres Kiefers so stark, dass es Ihre Mundöffnung eingeschränkt und Ihre Fähigkeit zu Essen beeinträchtigt hat?",
    options: SQ_YES_NO_OPTIONS,
    enableWhen: [{ questionId: "SQ9", operator: "=", value: "yes" }],
  },

  // SQ11 - Jaw lock in last 30 days that unlocked (enabled when SQ9 = yes)
  {
    id: "SQ11",
    type: "single_choice",
    text: "Hatten Sie in den letzten 30 Tagen eine Kieferklemme, sodass Sie den Mund, wenn auch nur kurzzeitig, nicht VOLLSTÄNDIG öffnen konnten, und löste sich diese anschließend, sodass Sie den Mund VOLLSTÄNDIG öffnen konnten?",
    options: SQ_YES_NO_OPTIONS,
    enableWhen: [{ questionId: "SQ9", operator: "=", value: "yes" }],
  },

  // SQ12 - Currently locked (enabled when SQ9 = yes AND SQ11 = yes)
  {
    id: "SQ12",
    type: "single_choice",
    text: "Ist Ihr Kiefer gegenwärtig blockiert oder eingeschränkt, so dass sich Ihr Kiefer nicht VOLLSTÄNDIG öffnen lässt?",
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
    text: "Ist Ihr Kiefer in den letzten 30 Tagen, bei weiter Mundöffnung, auch nur für einen kurzen Moment, blockiert bzw. hängen geblieben, sodass Sie den Mund von dieser weit geöffneten Position aus nicht mehr schließen konnten?",
    options: SQ_YES_NO_OPTIONS,
  },

  // SQ14 - Needed to do something to close (enabled when SQ13 = yes)
  {
    id: "SQ14",
    type: "single_choice",
    text: "Mussten Sie in den letzten 30 Tagen, als ihr Kiefer weit geöffnet blockiert oder hängen geblieben war, etwas unternehmen, um ihn schließen zu können, z.B. entspannen, bewegen, drücken oder umlenken?",
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
  id: QUESTIONNAIRE_ID.SQ,
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
    const prefix =
      q.parentId === "SQ4"
        ? "Aktivität beeinflusst Schmerzen"
        : "Aktivität beeinflusst Kopfschmerzen";
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
    SQ_SCREENS.map((q) => [q.id, { text: getDisplayText(q), section: getSectionName(q.id) }])
  ) as Record<SQQuestionId, { text: string; section: string }>;
