import type {
  PalpationMode,
  PalpationPainQuestion,
  PalpationSite,
  Region,
  Side,
  SiteDetailMode,
} from "../model/regions";
import {
  ALL_REGIONS,
  BASE_REGIONS,
  PALPATION_MODE_QUESTIONS,
  PALPATION_REGIONS,
  SITE_CONFIG,
  SITES_BY_GROUP,
} from "../model/regions";
import type { QuestionInstance } from "../projections/to-instances";

type ValueGetter = (path: string) => unknown;

/**
 * Context for validation that affects which fields are required.
 */
export interface ValidationContext {
  /** E4: Filter to BASE_REGIONS (3) or ALL_REGIONS (5) */
  includeAllRegions?: boolean;
  /** E9: Which pain questions are visible based on palpation duration */
  palpationMode?: PalpationMode;
  /** E9: Detailed (8 sites) or grouped (3 regions) view */
  siteDetailMode?: SiteDetailMode;
}

/**
 * Represents a region with incomplete pain interview data.
 */
export interface IncompleteRegion {
  region: Region;
  side: Side;
  missingPain: boolean;
  missingFamiliarPain: boolean;
  missingFamiliarHeadache: boolean;
}

export interface InterviewValidationResult {
  valid: boolean;
  incompleteRegions: IncompleteRegion[];
}

/**
 * Validate that all pain interview questions are complete.
 *
 * Rules:
 * - All pain questions must be answered (not undefined)
 * - If pain=yes, familiarPain must be answered
 * - If pain=yes AND region is temporalis, familiarHeadache must also be answered
 *
 * @param context.includeAllRegions - If false, only validate BASE_REGIONS (3 regions)
 */
export function validateInterviewCompletion(
  instances: QuestionInstance[],
  getValue: ValueGetter,
  context?: ValidationContext
): InterviewValidationResult {
  const incompleteRegions: IncompleteRegion[] = [];

  // Check for interview-level refusal
  const firstInstance = instances[0];
  if (firstInstance) {
    const interviewRefusedPath = getInterviewRefusedPath(firstInstance.path);
    if (getValue(interviewRefusedPath) === true) {
      // Interview refused, skip validation
      return { valid: true, incompleteRegions: [] };
    }
  }

  // Determine which regions to validate
  const regionsToValidate = context?.includeAllRegions ? ALL_REGIONS : BASE_REGIONS;

  // Group instances by region and side
  const regionGroups = new Map<string, QuestionInstance[]>();
  for (const inst of instances) {
    const { region, side } = inst.context;
    if (!region || !side) continue;

    // Skip regions not in the validation set
    if (!regionsToValidate.includes(region as Region)) continue;

    const key = `${region}-${side}`;
    const existing = regionGroups.get(key);
    if (existing) {
      existing.push(inst);
    } else {
      regionGroups.set(key, [inst]);
    }
  }

  // Check each region/side combination
  for (const [key, questions] of regionGroups) {
    const [region, side] = key.split("-") as [Region, Side];

    const painQ = questions.find((q) => q.context.painType === "pain");
    const familiarPainQ = questions.find((q) => q.context.painType === "familiarPain");
    const familiarHeadacheQ = questions.find((q) => q.context.painType === "familiarHeadache");

    const painValue = painQ ? getValue(painQ.path) : null;
    const familiarPainValue = familiarPainQ ? getValue(familiarPainQ.path) : null;
    const familiarHeadacheValue = familiarHeadacheQ ? getValue(familiarHeadacheQ.path) : null;

    const missingPain = painValue == null;
    const missingFamiliarPain = painValue === "yes" && familiarPainValue == null;
    const missingFamiliarHeadache =
      painValue === "yes" && familiarHeadacheQ != null && familiarHeadacheValue == null;

    if (missingPain || missingFamiliarPain || missingFamiliarHeadache) {
      incompleteRegions.push({
        region,
        side,
        missingPain,
        missingFamiliarPain,
        missingFamiliarHeadache,
      });
    }
  }

  return {
    valid: incompleteRegions.length === 0,
    incompleteRegions,
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
}

/**
 * Check if a field is enabled based on its enableWhen condition.
 * Disabled fields should not be validated.
 */
export function isFieldEnabled(instance: QuestionInstance, getSiblingValue: ValueGetter): boolean {
  if (!instance.enableWhen) return true;
  const siblingPath = instance.path.replace(/\.[^.]+$/, `.${instance.enableWhen.sibling}`);
  const siblingValue = getSiblingValue(siblingPath);

  // Handle equals condition
  if (instance.enableWhen.equals !== undefined) {
    return siblingValue === instance.enableWhen.equals;
  }

  // Handle notEquals condition
  if (instance.enableWhen.notEquals !== undefined) {
    return siblingValue !== instance.enableWhen.notEquals;
  }

  return true;
}

/**
 * Helper to get sibling terminated path from a measurement path.
 * e.g., "e4.maxAssisted.measurement" → "e4.maxAssisted.terminated"
 */
function getTerminatedSiblingPath(path: string): string {
  return path.replace(/\.[^.]+$/, ".terminated");
}

/**
 * Helper to get sibling refused path from a measurement path.
 * e.g., "e4.maxAssisted.measurement" → "e4.maxAssisted.refused"
 */
function getRefusedSiblingPath(path: string): string {
  return path.replace(/\.[^.]+$/, ".refused");
}

/**
 * Helper to get interview refused path from any interview field path.
 * e.g., "e4.maxUnassisted.left.temporalis.pain" → "e4.maxUnassisted.interviewRefused"
 */
function getInterviewRefusedPath(path: string): string {
  const parts = path.split(".");
  // Path structure: e4.{openingType}.{side}.{region}.{painType}
  // We want: e4.{openingType}.interviewRefused
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}.interviewRefused`;
  }
  return path.replace(/\.[^.]+$/, ".interviewRefused");
}

/**
 * Helper to get side-level refused path for palpation.
 * e.g., "e9.left.temporalisAnterior.pain" → "e9.left.refused"
 */
function getPalpationRefusedPath(path: string): string {
  const parts = path.split(".");
  // Path structure: e9.{side}.{site}.{painType}
  // We want: e9.{side}.refused
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}.refused`;
  }
  return path;
}

/**
 * Single source of truth for all form validation rules.
 * Returns a list of errors for the given instances.
 */
export function validateInstances(
  instances: QuestionInstance[],
  getValue: ValueGetter
): ValidationResult {
  const errors: Array<{ path: string; message: string }> = [];

  for (const instance of instances) {
    // Skip disabled fields
    if (!isFieldEnabled(instance, getValue)) continue;

    const value = getValue(instance.path);
    const config = instance.config as { required?: boolean; min?: number; max?: number };

    // Measurement-specific required validation
    if (instance.renderType === "measurement" && config.required) {
      const terminatedPath = getTerminatedSiblingPath(instance.path);
      const terminatedValue = getValue(terminatedPath);
      const refusedPath = getRefusedSiblingPath(instance.path);
      const refusedValue = getValue(refusedPath);

      // Check if terminated/refused siblings exist (not undefined) and are checked
      const hasTerminatedSibling = terminatedValue !== undefined;
      const isTerminated = terminatedValue === true;
      const isRefused = refusedValue === true;

      // Skip validation if refused
      if (isRefused) {
        continue;
      }

      if (value == null || value === "") {
        if (isTerminated) {
          // Terminated is checked - measurement not required, skip validation
          continue;
        }
        // Choose message based on whether terminated sibling exists
        const message = hasTerminatedSibling
          ? "Bitte Messwert eingeben"
          : "Bitte Messwert eingeben";
        errors.push({ path: instance.path, message });
        continue;
      }

      // Range validation for measurements with values
      const numValue = Number(value);
      const min = config.min ?? 0;
      const max = config.max ?? 100;
      if (numValue < min) {
        errors.push({ path: instance.path, message: `Minimum: ${min}` });
      } else if (numValue > max) {
        errors.push({ path: instance.path, message: `Maximum: ${max}` });
      }
      continue;
    }

    // Generic required validation (non-measurement fields)
    if (config.required) {
      // For checkbox groups, check for empty array
      if (instance.renderType === "checkboxGroup") {
        if (!Array.isArray(value) || value.length === 0) {
          errors.push({ path: instance.path, message: "Bitte mindestens eine Option auswählen" });
          continue;
        }
      }
      // For enum fields (single selection), use appropriate message
      else if (instance.renderType === "enum") {
        if (value == null || value === "") {
          errors.push({ path: instance.path, message: "Bitte eine Option auswählen" });
          continue;
        }
      }
      // For yesNo fields
      else if (instance.renderType === "yesNo") {
        if (value == null) {
          errors.push({ path: instance.path, message: "Bitte auswählen" });
          continue;
        }
      }
      // For other fields, check for null/empty string
      else if (value == null || value === "") {
        errors.push({ path: instance.path, message: "Dieses Feld ist erforderlich" });
        continue;
      }
    }

    // Range validation for non-required measurements with values
    if (instance.renderType === "measurement" && value != null && value !== "") {
      const numValue = Number(value);
      const min = config.min ?? 0;
      const max = config.max ?? 100;
      if (numValue < min) {
        errors.push({ path: instance.path, message: `Minimum: ${min}` });
      } else if (numValue > max) {
        errors.push({ path: instance.path, message: `Maximum: ${max}` });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Represents a palpation site with incomplete pain data.
 */
export interface IncompletePalpationSite {
  site: PalpationSite | Region; // Can be individual site or grouped region
  side: Side;
  missingQuestions: PalpationPainQuestion[];
}

export interface PalpationValidationResult {
  valid: boolean;
  incompleteSites: IncompletePalpationSite[];
}

/**
 * Determine which pain questions are applicable for a given site/region.
 *
 * Rules:
 * - pain and familiarPain are always required
 * - familiarHeadache only for temporalis sites (hasHeadache: true)
 * - referredPain only in standard/extended modes
 * - spreadingPain only in extended mode AND for non-TMJ sites (hasSpreading: true)
 */
function getApplicableQuestions(
  siteOrRegion: PalpationSite | Region,
  palpationMode: PalpationMode,
  isGrouped: boolean
): PalpationPainQuestion[] {
  const modeQuestions = PALPATION_MODE_QUESTIONS[palpationMode];

  if (isGrouped) {
    // For grouped mode, check if the region supports each question
    const region = siteOrRegion as Region;
    // Only PALPATION_REGIONS are valid for palpation
    if (!PALPATION_REGIONS.includes(region)) return [];

    const sites = SITES_BY_GROUP[region];
    if (!sites || sites.length === 0) return [];

    // Get config from first site in group (all sites in group have same config)
    const firstSiteConfig = SITE_CONFIG[sites[0]];

    return modeQuestions.filter((q) => {
      if (q === "familiarHeadache") return firstSiteConfig.hasHeadache;
      if (q === "spreadingPain") return firstSiteConfig.hasSpreading;
      return true;
    });
  }

  // For detailed mode, check site-specific config
  const site = siteOrRegion as PalpationSite;
  const config = SITE_CONFIG[site];
  if (!config) return [];

  return modeQuestions.filter((q) => {
    if (q === "familiarHeadache") return config.hasHeadache;
    if (q === "spreadingPain") return config.hasSpreading;
    return true;
  });
}

/**
 * Validate that all palpation pain questions are complete.
 *
 * Rules:
 * - pain is always required for each site
 * - familiarPain is only required when pain=yes
 * - familiarHeadache is only required for temporalis sites when pain=yes
 * - referredPain is only required in standard/extended mode
 * - spreadingPain is only required in extended mode for non-TMJ sites
 *
 * @param context.palpationMode - Determines which questions are validated
 * @param context.siteDetailMode - Detailed (8 sites) or grouped (3 regions)
 */
export function validatePalpationCompletion(
  instances: QuestionInstance[],
  getValue: ValueGetter,
  context?: ValidationContext
): PalpationValidationResult {
  const incompleteSites: IncompletePalpationSite[] = [];
  const palpationMode = context?.palpationMode ?? "basic";
  const isGrouped = context?.siteDetailMode === "grouped";

  // Check for side-level refusal
  const firstInstance = instances[0];
  if (firstInstance) {
    const refusedPath = getPalpationRefusedPath(firstInstance.path);
    if (getValue(refusedPath) === true) {
      // Side refused, skip validation
      return { valid: true, incompleteSites: [] };
    }
  }

  // Group instances by site/region and side
  const siteGroups = new Map<string, QuestionInstance[]>();
  for (const inst of instances) {
    const { side } = inst.context;
    // For palpation, use site (detailed) or region (grouped)
    // Note: context uses "site" not "palpationSite"
    const siteOrRegion = isGrouped ? inst.context.region : inst.context.site;
    if (!siteOrRegion || !side) continue;

    // In grouped mode, only validate PALPATION_REGIONS
    if (isGrouped && !PALPATION_REGIONS.includes(siteOrRegion as Region)) continue;

    const key = `${siteOrRegion}-${side}`;
    const existing = siteGroups.get(key);
    if (existing) {
      existing.push(inst);
    } else {
      siteGroups.set(key, [inst]);
    }
  }

  // Check each site/side combination
  for (const [key, questions] of siteGroups) {
    const [siteOrRegion, side] = key.split("-") as [PalpationSite | Region, Side];
    const applicableQuestions = getApplicableQuestions(siteOrRegion, palpationMode, isGrouped);

    const missingQuestions: PalpationPainQuestion[] = [];

    // Get pain value first to determine conditional requirements
    const painQ = questions.find((q) => q.context.painType === "pain");
    const painValue = painQ ? getValue(painQ.path) : null;

    for (const questionType of applicableQuestions) {
      const q = questions.find((inst) => inst.context.painType === questionType);

      // Skip if this question doesn't exist in the instances
      if (!q) continue;

      const value = getValue(q.path);

      // pain is always required
      if (questionType === "pain") {
        if (value == null) {
          missingQuestions.push(questionType);
        }
        continue;
      }

      // All other questions (familiarPain, familiarHeadache, referredPain, spreadingPain)
      // are only required when pain=yes
      if (painValue === "yes" && value == null) {
        missingQuestions.push(questionType);
      }
    }

    if (missingQuestions.length > 0) {
      incompleteSites.push({
        site: siteOrRegion,
        side,
        missingQuestions,
      });
    }
  }

  return {
    valid: incompleteSites.length === 0,
    incompleteSites,
  };
}
