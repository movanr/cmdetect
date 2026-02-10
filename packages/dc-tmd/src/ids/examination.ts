/**
 * DC/TMD Examination Protocol IDs
 *
 * Section IDs (E1-E10) and common field keys for examination data paths.
 * Pain types are in anatomy.ts.
 */

import { REGIONS } from "./anatomy";

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

// === SECTION LABELS (German) ===
// short: concise name for menus/badges, full: complete name for card titles
export const SECTION_LABELS: Record<SectionId, { short: string; full: string }> = {
  e1: { short: "Schmerzlokalisation", full: "Schmerzlokalisation" },
  e2: { short: "Schneidekantenverhältnisse", full: "Schneidekantenverhältnisse" },
  e3: { short: "Öffnungsmuster", full: "Öffnungs- und Schließmuster" },
  e4: { short: "Mundöffnung", full: "Öffnungs- und Schließbewegungen" },
  e5: { short: "Lateralbewegungen", full: "Lateral- und Protrusionsbewegungen" },
  e6: { short: "Gelenkgeräusche Öffnung", full: "Gelenkgeräusche bei Öffnung" },
  e7: { short: "Gelenkgeräusche Lateral", full: "Gelenkgeräusche bei Lateralbewegungen" },
  e8: { short: "Gelenkblockierung", full: "Gelenkblockierung" },
  e9: { short: "Palpation", full: "Palpation Muskeln & Kiefergelenk" },
  e10: { short: "Ergänzende Untersuchungen", full: "Ergänzende Untersuchungen" },
};

/** Get section number from ID (e.g., "e3" -> "3", "e10" -> "10") */
export const getSectionNumber = (id: SectionId): string => id.slice(1);

/** Get section title with U-prefix (e.g., "U3: Öffnungsmuster") */
export const getSectionTitle = (id: SectionId): string =>
  `U${getSectionNumber(id)}: ${SECTION_LABELS[id].short}`;

/** Get section card title with U-prefix (e.g., "U3 - Öffnungs- und Schließmuster") */
export const getSectionCardTitle = (id: SectionId): string =>
  `U${getSectionNumber(id)} - ${SECTION_LABELS[id].full}`;

/** Get section badge (e.g., "U3") */
export const getSectionBadge = (id: SectionId): string => `U${getSectionNumber(id)}`;

// === E1 FIELDS (Pain & Headache Location) ===
export const E1_FIELDS = {
  painLocation: "painLocation",
  headacheLocation: "headacheLocation",
} as const;
export type E1Field = keyof typeof E1_FIELDS;

// === E1 PAIN LOCATION OPTIONS ===
// Reuses REGIONS from anatomy.ts + adds "none" option
export const E1_PAIN_LOCATIONS = {
  none: "Keine",
  ...REGIONS, // temporalis, masseter, tmj, otherMast, nonMast
} as const;
export type E1PainLocation = keyof typeof E1_PAIN_LOCATIONS;
export const E1_PAIN_LOCATION_KEYS = Object.keys(E1_PAIN_LOCATIONS) as E1PainLocation[];

// === E1 HEADACHE LOCATION OPTIONS ===
export const E1_HEADACHE_LOCATIONS = {
  none: "Keine",
  temporalis: REGIONS.temporalis, // "Temporalis"
  other: "Andere",
} as const;
export type E1HeadacheLocation = keyof typeof E1_HEADACHE_LOCATIONS;
export const E1_HEADACHE_LOCATION_KEYS = Object.keys(E1_HEADACHE_LOCATIONS) as E1HeadacheLocation[];

// === E2 FIELDS (Incisal Relationships) ===
export const E2_FIELDS = {
  referenceTooth: "referenceTooth",
  horizontalOverjet: "horizontalOverjet",
  verticalOverlap: "verticalOverlap",
  midlineDeviation: "midlineDeviation",
} as const;
export type E2Field = keyof typeof E2_FIELDS;

// === E2 REFERENCE TOOTH OPTIONS (FDI notation) ===
export const E2_REFERENCE_TEETH = {
  tooth11: "11",
  tooth21: "21",
  other: "Anderer",
} as const;
export type E2ReferenceTooth = keyof typeof E2_REFERENCE_TEETH;
export const E2_REFERENCE_TOOTH_KEYS = Object.keys(E2_REFERENCE_TEETH) as E2ReferenceTooth[];

// === E2 MIDLINE DIRECTION OPTIONS ===
export const E2_MIDLINE_DIRECTIONS = {
  right: "Rechts",
  left: "Links",
  na: "N/A",
} as const;
export type E2MidlineDirection = keyof typeof E2_MIDLINE_DIRECTIONS;
export const E2_MIDLINE_DIRECTION_KEYS = Object.keys(E2_MIDLINE_DIRECTIONS) as E2MidlineDirection[];

// === E3 FIELDS (Opening Pattern) ===
export const E3_FIELDS = {
  openingPattern: "openingPattern",
  deviation: "deviation",
} as const;
export type E3Field = keyof typeof E3_FIELDS;

// === E3 OPENING PATTERN OPTIONS ===
export const E3_OPENING_PATTERNS = {
  straight: "Gerade",
  correctedDeviation: "Korrigierte Deviation",
  uncorrectedRight: "Unkorrigierte Deviation nach rechts",
  uncorrectedLeft: "Unkorrigierte Deviation nach links",
} as const;
export type E3OpeningPattern = keyof typeof E3_OPENING_PATTERNS;
export const E3_OPENING_PATTERN_KEYS = Object.keys(E3_OPENING_PATTERNS) as E3OpeningPattern[];

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

// === E5 MOVEMENT TYPES (Lateral/Protrusive) ===
export const MOVEMENT_TYPES = {
  lateralLeft: "lateralLeft",
  lateralRight: "lateralRight",
  protrusive: "protrusive",
} as const;
export type MovementType = keyof typeof MOVEMENT_TYPES;
export const MOVEMENT_TYPE_KEYS = Object.keys(MOVEMENT_TYPES) as MovementType[];

// === E8 JOINT LOCKING ===
export const E8_LOCKING_TYPES = {
  closedLocking: "closedLocking",
  openLocking: "openLocking",
} as const;
export type E8LockingType = keyof typeof E8_LOCKING_TYPES;

export const E8_LOCKING_FIELDS = {
  locking: "locking",
  reduction: "reduction",
} as const;
export type E8LockingField = keyof typeof E8_LOCKING_FIELDS;

// === E6-E8 JOINT SOUNDS ===
export const JOINT_SOUNDS = {
  click: "click",
  crepitus: "crepitus",
} as const;
export type JointSound = keyof typeof JOINT_SOUNDS;
export const JOINT_SOUND_KEYS = Object.keys(JOINT_SOUNDS) as JointSound[];
