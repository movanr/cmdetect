/**
 * Examination model versioning engine.
 *
 * Transforms persisted examination data from older model versions to the
 * current version *before* zod validation. This prevents data loss when the
 * FormValues model evolves (field added/renamed/type changed).
 *
 * ## Adding a new migration
 *
 * 1. Bump `CURRENT_MODEL_VERSION` to N+1.
 * 2. Append a migration function to the `migrations` array that transforms
 *    raw data from version N → N+1.
 * 3. Add a test in `model-versioning.test.ts`.
 *
 * The runtime invariant `CURRENT_MODEL_VERSION === migrations.length + 1`
 * ensures you don't forget to add a migration when bumping the version.
 */

export type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/** Current model version — bump when FormValues model changes. */
export const CURRENT_MODEL_VERSION = 1;

/**
 * Ordered migration functions. Each transforms data from version N to N+1.
 * Index 0 = v1→v2, index 1 = v2→v3, etc.
 */
export const migrations: Migration[] = [
  // No migrations yet — v1 is the baseline.
];

// Runtime invariant: version and migration count must stay in sync.
if (CURRENT_MODEL_VERSION !== migrations.length + 1) {
  throw new Error(
    `[examination] Model version mismatch: CURRENT_MODEL_VERSION is ${CURRENT_MODEL_VERSION} ` +
      `but there are ${migrations.length} migrations (expected ${CURRENT_MODEL_VERSION - 1}).`
  );
}

/**
 * Apply migrations to raw examination data, transforming it from `fromVersion`
 * up to `CURRENT_MODEL_VERSION`.
 *
 * - `null`/`undefined` version → treated as v1 (legacy data before versioning).
 * - Future version (> current) → returned as-is with a console warning.
 * - Current version → no-op.
 */
export function migrateExaminationData(
  data: Record<string, unknown>,
  fromVersion: number | null | undefined
): Record<string, unknown> {
  const version = fromVersion ?? 1;

  if (version === CURRENT_MODEL_VERSION) {
    return data;
  }

  if (version > CURRENT_MODEL_VERSION) {
    console.warn(
      `[examination] Data has future model version ${version} (current: ${CURRENT_MODEL_VERSION}). ` +
        "Passing through without migration — this may cause validation errors."
    );
    return data;
  }

  // Apply migrations sequentially: v→v+1→v+2→…→current
  let migrated = data;
  for (let v = version; v < CURRENT_MODEL_VERSION; v++) {
    const migration = migrations[v - 1]; // migrations[0] = v1→v2
    migrated = migration(migrated);
  }

  return migrated;
}
