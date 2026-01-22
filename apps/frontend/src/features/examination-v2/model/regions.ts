/**
 * Re-exports DC/TMD anatomical IDs from the shared package.
 *
 * This module re-exports all anatomical structures from @cmdetect/dc-tmd
 * for use in examination-v2 components.
 *
 * @see packages/dc-tmd/src/ids/anatomy.ts for the source definitions
 */

export {
  // Sides
  SIDES,
  type Side,
  SIDE_KEYS,
  // Movement regions (E4, E5)
  REGIONS,
  type Region,
  REGION_KEYS,
  SVG_REGIONS,
  BASE_REGIONS,
  ALL_REGIONS,
  getMovementPainQuestions,
  // Palpation sites (E9)
  PALPATION_SITES,
  type PalpationSite,
  PALPATION_SITE_KEYS,
  // Muscle groups
  MUSCLE_GROUPS,
  type MuscleGroup,
  MUSCLE_GROUP_KEYS,
  // Pain types
  PAIN_TYPES,
  type PainType,
  PAIN_TYPE_KEYS,
  // Site configuration
  type SiteConfig,
  SITE_CONFIG,
  // Palpation pain questions
  PALPATION_PAIN_QUESTIONS,
  type PalpationPainQuestion,
  getPalpationPainQuestions,
  // Palpation modes
  PALPATION_MODES,
  type PalpationMode,
  PALPATION_MODE_KEYS,
  PALPATION_MODE_QUESTIONS,
  // Site detail modes
  SITE_DETAIL_MODES,
  type SiteDetailMode,
  SITE_DETAIL_MODE_KEYS,
  // Site-group mappings
  SITES_BY_GROUP,
  GROUP_CONFIG,
  // Examination protocol IDs
  SECTIONS,
  type SectionId,
  SECTION_KEYS,
  OPENING_TYPES,
  type OpeningType,
  OPENING_TYPE_KEYS,
  MEASUREMENT_FIELDS,
  type MeasurementField,
  MEASUREMENT_FIELD_KEYS,
} from "@cmdetect/dc-tmd";
