/**
 * DC/TMD Symptom Questionnaire (SQ) - Question Definitions
 * Source: Diagnostic Criteria for Temporomandibular Disorders - Symptom Questionnaire (12May2013)
 *
 * Questions are flattened so each screen shows one item:
 * - Matrix questions (SQ4, SQ7) are expanded into individual rows
 * - Total screens: 22 (14 base questions, but SQ4 and SQ7 have 4 rows each)
 */

import type { SQQuestion } from "../model/question";

// Section metadata for reference
export const SQ_SECTIONS = {
  pain: { id: "section_pain", title: "Pain" },
  headache: { id: "section_headache", title: "Headache" },
  jointNoises: { id: "section_joint_noises", title: "Jaw Joint Noises" },
  closedLocking: { id: "section_closed_locking", title: "Closed Locking of the Jaw" },
  openLocking: { id: "section_open_locking", title: "Open Locking of the Jaw" },
} as const;

/**
 * All screens in order, with matrix questions expanded
 * Skip logic is attached to relevant questions
 */
export const SQ_SCREENS: SQQuestion[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: PAIN
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ1 - Pain ever (always shown)
  {
    id: "SQ1",
    type: "single_choice",
    text: "Have you ever had pain in your jaw, temple, in the ear, or in front of the ear on either side?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
  },

  // SQ2 - Pain onset duration (enabled when SQ1 = yes)
  {
    id: "SQ2",
    type: "composite_number",
    text: "How many years or months ago did your pain in the jaw, temple, in the ear, or in front of the ear first begin?",
    fields: {
      years: { id: "SQ2_years", label: "Years" },
      months: { id: "SQ2_months", label: "Months" },
    },
    enableWhen: [{ questionId: "SQ1", operator: "=", value: "yes" }],
  },

  // SQ3 - Pain in last 30 days (enabled when SQ1 = yes)
  {
    id: "SQ3",
    type: "single_choice",
    text: "In the last 30 days, which of the following best describes any pain in your jaw, temple, in the ear, or in front of the ear on either side?",
    note: "Select ONE response.",
    options: [
      { value: "no_pain", label: "No pain" },
      { value: "intermittent", label: "Pain comes and goes" },
      { value: "continuous", label: "Pain is always present" },
    ],
    enableWhen: [{ questionId: "SQ1", operator: "=", value: "yes" }],
  },

  // SQ4 - Activities affecting pain (Matrix - 4 rows expanded)
  // Enabled when SQ1 = yes AND SQ3 != no_pain
  {
    id: "SQ4_A",
    type: "matrix_row",
    parentId: "SQ4",
    text: "In the last 30 days, did the following activities change any pain (that is, make it better or make it worse) in your jaw, temple, in the ear, or in front of the ear on either side?",
    rowText: "Chewing hard or tough food",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_B",
    type: "matrix_row",
    parentId: "SQ4",
    text: "In the last 30 days, did the following activities change any pain (that is, make it better or make it worse) in your jaw, temple, in the ear, or in front of the ear on either side?",
    rowText: "Opening your mouth, or moving your jaw forward or to the side",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_C",
    type: "matrix_row",
    parentId: "SQ4",
    text: "In the last 30 days, did the following activities change any pain (that is, make it better or make it worse) in your jaw, temple, in the ear, or in front of the ear on either side?",
    rowText: "Jaw habits such as holding teeth together, clenching/grinding teeth, or chewing gum",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },
  {
    id: "SQ4_D",
    type: "matrix_row",
    parentId: "SQ4",
    text: "In the last 30 days, did the following activities change any pain (that is, make it better or make it worse) in your jaw, temple, in the ear, or in front of the ear on either side?",
    rowText: "Other jaw activities such as talking, kissing, or yawning",
    enableWhen: [
      { questionId: "SQ1", operator: "=", value: "yes" },
      { questionId: "SQ3", operator: "!=", value: "no_pain" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: HEADACHE
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ5 - Temple headache (always shown)
  {
    id: "SQ5",
    type: "single_choice",
    text: "In the last 30 days, have you had any headaches that included the temple areas of your head?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
  },

  // SQ6 - Temple headache onset duration (enabled when SQ5 = yes)
  {
    id: "SQ6",
    type: "composite_number",
    text: "How many years or months ago did your temple headache first begin?",
    fields: {
      years: { id: "SQ6_years", label: "Years" },
      months: { id: "SQ6_months", label: "Months" },
    },
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },

  // SQ7 - Activities affecting headache (Matrix - 4 rows expanded)
  // Enabled when SQ5 = yes
  {
    id: "SQ7_A",
    type: "matrix_row",
    parentId: "SQ7",
    text: "In the last 30 days, did the following activities change any headache (that is, make it better or make it worse) in your temple area on either side?",
    rowText: "Chewing hard or tough food",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_B",
    type: "matrix_row",
    parentId: "SQ7",
    text: "In the last 30 days, did the following activities change any headache (that is, make it better or make it worse) in your temple area on either side?",
    rowText: "Opening your mouth, or moving your jaw forward or to the side",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_C",
    type: "matrix_row",
    parentId: "SQ7",
    text: "In the last 30 days, did the following activities change any headache (that is, make it better or make it worse) in your temple area on either side?",
    rowText: "Jaw habits such as holding teeth together, clenching/grinding, or chewing gum",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },
  {
    id: "SQ7_D",
    type: "matrix_row",
    parentId: "SQ7",
    text: "In the last 30 days, did the following activities change any headache (that is, make it better or make it worse) in your temple area on either side?",
    rowText: "Other jaw activities such as talking, kissing, or yawning",
    enableWhen: [{ questionId: "SQ5", operator: "=", value: "yes" }],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: JAW JOINT NOISES
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ8 - Jaw joint noises
  {
    id: "SQ8",
    type: "single_choice",
    text: "In the last 30 days, have you had any jaw joint noise(s) when you moved or used your jaw?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: CLOSED LOCKING OF THE JAW
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ9 - Jaw lock/catch ever (always shown)
  {
    id: "SQ9",
    type: "single_choice",
    text: "Have you ever had your jaw lock or catch, even for a moment, so that it would not open ALL THE WAY?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
  },

  // SQ10 - Jaw lock severity (enabled when SQ9 = yes)
  {
    id: "SQ10",
    type: "single_choice",
    text: "Was your jaw lock or catch severe enough to limit your jaw opening and interfere with your ability to eat?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
    enableWhen: [{ questionId: "SQ9", operator: "=", value: "yes" }],
  },

  // SQ11 - Jaw lock in last 30 days that unlocked (enabled when SQ9 = yes)
  {
    id: "SQ11",
    type: "single_choice",
    text: "In the last 30 days, did your jaw lock so you could not open ALL THE WAY, even for a moment, and then unlock so you could open ALL THE WAY?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
    enableWhen: [{ questionId: "SQ9", operator: "=", value: "yes" }],
  },

  // SQ12 - Currently locked (enabled when SQ9 = yes AND SQ11 = yes)
  {
    id: "SQ12",
    type: "single_choice",
    text: "Is your jaw currently locked or limited so that your jaw will not open ALL THE WAY?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
    enableWhen: [
      { questionId: "SQ9", operator: "=", value: "yes" },
      { questionId: "SQ11", operator: "=", value: "yes" },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION: OPEN LOCKING OF THE JAW
  // ═══════════════════════════════════════════════════════════════════════════

  // SQ13 - Open locking in last 30 days (always shown)
  {
    id: "SQ13",
    type: "single_choice",
    text: "In the last 30 days, when you opened your mouth wide, did your jaw lock or catch even for a moment such that you could not close it from this wide open position?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
  },

  // SQ14 - Needed to do something to close (enabled when SQ13 = yes)
  {
    id: "SQ14",
    type: "single_choice",
    text: "In the last 30 days, when your jaw locked or caught wide open, did you have to do something to get it to close including resting, moving, pushing, or maneuvering it?",
    options: [
      { value: "no", label: "No" },
      { value: "yes", label: "Yes" },
    ],
    enableWhen: [{ questionId: "SQ13", operator: "=", value: "yes" }],
  },
];

/**
 * Get the index of a question by ID
 */
export function getScreenIndexById(id: string): number {
  return SQ_SCREENS.findIndex((q) => q.id === id);
}

/**
 * Total number of screens in the questionnaire
 */
export const SQ_TOTAL_SCREENS = SQ_SCREENS.length;
