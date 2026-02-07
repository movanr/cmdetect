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
 * Parse and validate examination form data from an untrusted source.
 *
 * Returns validated FormValues on success, or null if the data doesn't
 * match the current schema (e.g., stale localStorage draft after a model change).
 */
export function parseExaminationData(data: unknown): FormValues | null {
  const result = examinationSchema.safeParse(data);
  if (result.success) {
    return result.data as FormValues;
  }

  console.warn(
    "[examination] Failed to validate persisted data — falling back to defaults.",
    result.error.issues.slice(0, 5) // Log first 5 issues to avoid noise
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
 * Migrate persisted data to the current model version, then validate.
 *
 * Extracts `_modelVersion` from the data itself (embedded alongside form fields).
 * Use this on the **load path** (backend responses, localStorage drafts)
 * to ensure old data is transformed before zod validation.
 *
 * Returns validated FormValues on success, or null if the data is invalid
 * even after migration.
 */
export function migrateAndParseExaminationData(
  data: unknown
): FormValues | null {
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return parseExaminationData(data); // delegates to existing null-handling
  }

  const raw = data as Record<string, unknown>;
  const version = typeof raw._modelVersion === "number" ? raw._modelVersion : null;

  const migrated = migrateExaminationData(raw, version);
  return parseExaminationData(migrated);
}

export { CURRENT_MODEL_VERSION } from "./model-versioning";

/**
 * Get the default form values from the model.
 * Used as fallback when persisted data fails validation.
 */
export function getExaminationDefaults(): FormValues {
  return examinationDefaults as FormValues;
}
