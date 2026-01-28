/**
 * Re-exports DC/TMD anatomical IDs from the shared package.
 *
 * This module re-exports all anatomical regions from @cmdetect/dc-tmd
 * for use in examination-v2 components.
 *
 * @see packages/dc-tmd/src/ids/anatomy.ts for the source definitions
 */

export {
  ALL_REGIONS,
  BASE_REGIONS,
  getMovementPainQuestions,
  getPalpationPainQuestions,
  GROUP_CONFIG,
  MEASUREMENT_FIELD_KEYS,
  MEASUREMENT_FIELDS,
  OPENING_TYPE_KEYS,
  OPENING_TYPES,
  PAIN_TYPE_KEYS,
  // Pain types
  PAIN_TYPES,
  PALPATION_MODE_KEYS,
  PALPATION_MODE_QUESTIONS,
  // Palpation modes
  PALPATION_MODES,
  // Palpation pain questions
  PALPATION_PAIN_QUESTIONS,
  // Palpation regions (E9) - the 3 regions with palpation sites
  PALPATION_REGIONS,
  PALPATION_SITE_KEYS,
  // Palpation sites (E9)
  PALPATION_SITES,
  REGION_KEYS,
  // Movement regions (E4, E5)
  REGIONS,
  SECTION_KEYS,
  // Examination protocol IDs
  SECTIONS,
  SIDE_KEYS,
  // Sides
  SIDES,
  SITE_CONFIG,
  SITE_DETAIL_MODE_KEYS,
  // Site detail modes
  SITE_DETAIL_MODES,
  // Site-group mappings
  SITES_BY_GROUP,
  SVG_REGIONS,
  type MeasurementField,
  type OpeningType,
  type PainType,
  type PalpationMode,
  type PalpationPainQuestion,
  type PalpationSite,
  type Region,
  type SectionId,
  type Side,
  // Site configuration
  type SiteConfig,
  type SiteDetailMode,
} from "@cmdetect/dc-tmd";
