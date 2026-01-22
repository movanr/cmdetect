/**
 * DC/TMD Examination Protocol IDs
 *
 * Section IDs (E1-E10) and common field keys for examination data paths.
 * Pain types are in anatomy.ts.
 */

// === SECTIONS (E1-E10) ===
export const SECTIONS = {
  e1: "e1",
  e2: "e2",
  e3: "e3",
  e4: "e4",
  e5: "e5",
  e6: "e6",
  e7: "e7",
  e8: "e8",
  e9: "e9",
  e10: "e10",
} as const;
export type SectionId = keyof typeof SECTIONS;
export const SECTION_KEYS = Object.keys(SECTIONS) as SectionId[];

// === OPENING TYPES (E4 sub-groups) ===
export const OPENING_TYPES = {
  painFree: "painFree",
  maxUnassisted: "maxUnassisted",
  maxAssisted: "maxAssisted",
} as const;
export type OpeningType = keyof typeof OPENING_TYPES;
export const OPENING_TYPE_KEYS = Object.keys(OPENING_TYPES) as OpeningType[];

// === MEASUREMENT FIELDS ===
export const MEASUREMENT_FIELDS = {
  measurement: "measurement",
  terminated: "terminated",
} as const;
export type MeasurementField = keyof typeof MEASUREMENT_FIELDS;
export const MEASUREMENT_FIELD_KEYS = Object.keys(MEASUREMENT_FIELDS) as MeasurementField[];
