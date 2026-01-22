/**
 * DC/TMD Diagnosis IDs - All 12 DC/TMD diagnoses.
 *
 * Based on the official DC/TMD diagnostic criteria:
 * - Pain disorders: myalgia subtypes, arthralgia, headache attributed to TMD
 * - Joint disorders: disc displacement variants, degenerative joint disease, subluxation
 *
 * Reference: Schiffman E, et al. (2014) Journal of Oral & Facial Pain and Headache, 28:6-27
 */

// === DIAGNOSES ===
export const DIAGNOSES = {
  myalgia: "Myalgia",
  localMyalgia: "Local Myalgia",
  myofascialPainWithSpreading: "Myofascial Pain with Spreading",
  myofascialPainWithReferral: "Myofascial Pain with Referral",
  arthralgia: "Arthralgia",
  headacheAttributedToTmd: "Headache Attributed to TMD",
  discDisplacementWithReduction: "Disc Displacement with Reduction",
  discDisplacementWithReductionIntermittentLocking:
    "Disc Displacement with Reduction, with Intermittent Locking",
  discDisplacementWithoutReductionLimitedOpening:
    "Disc Displacement without Reduction, with Limited Opening",
  discDisplacementWithoutReductionWithoutLimitedOpening:
    "Disc Displacement without Reduction, without Limited Opening",
  degenerativeJointDisease: "Degenerative Joint Disease",
  subluxation: "Subluxation",
} as const;
export type DiagnosisId = keyof typeof DIAGNOSES;
export const DIAGNOSIS_KEYS = Object.keys(DIAGNOSES) as DiagnosisId[];

// === DIAGNOSIS CATEGORIES ===
export const PAIN_DISORDER_IDS: readonly DiagnosisId[] = [
  "myalgia",
  "localMyalgia",
  "myofascialPainWithSpreading",
  "myofascialPainWithReferral",
  "arthralgia",
  "headacheAttributedToTmd",
];

export const JOINT_DISORDER_IDS: readonly DiagnosisId[] = [
  "discDisplacementWithReduction",
  "discDisplacementWithReductionIntermittentLocking",
  "discDisplacementWithoutReductionLimitedOpening",
  "discDisplacementWithoutReductionWithoutLimitedOpening",
  "degenerativeJointDisease",
  "subluxation",
];

// === MYALGIA SUBTYPES ===
// Myalgia subtypes are mutually exclusive based on pain pattern
export const MYALGIA_SUBTYPE_IDS: readonly DiagnosisId[] = [
  "localMyalgia",
  "myofascialPainWithSpreading",
  "myofascialPainWithReferral",
];

// === DIAGNOSIS HIERARCHY ===
// Some diagnoses require a parent diagnosis
export const DIAGNOSIS_PARENT: Partial<Record<DiagnosisId, DiagnosisId>> = {
  localMyalgia: "myalgia",
  myofascialPainWithSpreading: "myalgia",
  myofascialPainWithReferral: "myalgia",
  discDisplacementWithReductionIntermittentLocking: "discDisplacementWithReduction",
};

// Headache attributed to TMD requires either myalgia or arthralgia
export const HEADACHE_REQUIRES_PRIMARY: readonly DiagnosisId[] = ["myalgia", "arthralgia"];
