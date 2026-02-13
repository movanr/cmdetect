/**
 * Validation helpers for examination persistence boundaries.
 *
 * Uses the model-generated zod schema to validate data at serialization/deserialization
 * boundaries (localStorage drafts, GraphQL responses) before it enters the form.
 */

import { z } from "zod";
import { SECTION_KEYS, type SectionId } from "@cmdetect/dc-tmd";
import {
  examinationSchema,
  examinationDefaults,
  type FormValues,
} from "../form/use-examination-form";
import { migrateExaminationData } from "./model-versioning";

/** Schema for validating completedSections arrays from untrusted sources */
const sectionIdSchema = z.enum(SECTION_KEYS as [SectionId, ...SectionId[]]);
const completedSectionsSchema = z.array(sectionIdSchema);

/**
 * Try to parse examination data against the schema.
 * Returns validated FormValues on success, or null on failure. Does not log.
 */
function tryParse(data: unknown): FormValues | null {
  const result = examinationSchema.safeParse(data);
  if (result.success) {
    return result.data as FormValues;
  }
  return null;
}

/**
 * Parse and validate examination form data from an untrusted source.
 *
 * Returns validated FormValues on success, or null if the data doesn't
 * match the current schema (e.g., stale localStorage draft after a model change).
 */
export function parseExaminationData(data: unknown): FormValues | null {
  const result = tryParse(data);
  if (result) return result;

  console.warn(
    "[examination] Failed to validate persisted data — falling back to defaults.",
  );
  return null;
}

/**
 * Parse and validate a completedSections array.
 * Filters out any invalid section IDs (e.g., from a renamed/removed section).
 */
export function parseCompletedSections(data: unknown): SectionId[] {
  if (!Array.isArray(data)) return [];

  const result = completedSectionsSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  // Graceful degradation: keep only the valid entries
  return data.filter(
    (item): item is SectionId =>
      typeof item === "string" && sectionIdSchema.safeParse(item).success
  );
}

/**
 * Deep-merge source into target: fills missing keys from target (defaults)
 * while preserving existing values from source (persisted data).
 */
function deepMergeWithDefaults(
  source: Record<string, unknown>,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...defaults };

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const defVal = defaults[key];

    if (
      srcVal != null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      defVal != null &&
      typeof defVal === "object" &&
      !Array.isArray(defVal)
    ) {
      // Recursively merge nested objects
      result[key] = deepMergeWithDefaults(
        srcVal as Record<string, unknown>,
        defVal as Record<string, unknown>
      );
    } else if (key in defaults) {
      // Preserve source value for known keys
      result[key] = srcVal;
    }
    // Unknown keys (not in defaults) are dropped — zod would strip them anyway
  }

  return result;
}

/**
 * Migrate persisted data to the current model version, then validate.
 *
 * Extracts `_modelVersion` from the data itself (embedded alongside form fields).
 * Use this on the **load path** (backend responses, localStorage drafts)
 * to ensure old data is transformed before zod validation.
 *
 * If schema validation fails after migration (e.g., old data missing fields
 * added between saves), falls back to deep-merging with current defaults
 * to fill structural gaps while preserving existing values.
 *
 * Returns validated FormValues on success, or null if the data is invalid
 * even after migration and merge.
 */
export function migrateAndParseExaminationData(
  data: unknown
): FormValues | null {
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return parseExaminationData(data); // delegates to existing null-handling
  }

  const raw = data as Record<string, unknown>;
  const version = typeof raw._modelVersion === "number" ? raw._modelVersion : null;

  // Only attempt recovery if the source data has real section keys.
  // This prevents turning empty/junk objects into valid defaults.
  const sectionKeys = new Set(SECTION_KEYS as readonly string[]);
  const hasSectionData = Object.keys(raw).some(
    (k) => sectionKeys.has(k) && raw[k] != null && typeof raw[k] === "object"
  );

  const migrated = migrateExaminationData(raw, version);

  // Try direct validation first (fast path)
  const direct = tryParse(migrated);
  if (direct) return direct;

  // No real examination data → nothing to recover
  if (!hasSectionData) {
    console.warn("[examination] Failed to validate persisted data — falling back to defaults.");
    return null;
  }

  // Fallback: deep-merge with defaults to fill any structural gaps
  // (e.g., fields added to e1-e9 models after the data was saved)
  const merged = deepMergeWithDefaults(
    migrated,
    examinationDefaults as Record<string, unknown>
  );
  const result = tryParse(merged);
  if (!result) {
    console.warn("[examination] Failed to validate persisted data after merge — falling back to defaults.");
  }
  return result;
}

export { CURRENT_MODEL_VERSION } from "./model-versioning";

/**
 * Get the default form values from the model.
 * Used as fallback when persisted data fails validation.
 */
export function getExaminationDefaults(): FormValues {
  return examinationDefaults as FormValues;
}
