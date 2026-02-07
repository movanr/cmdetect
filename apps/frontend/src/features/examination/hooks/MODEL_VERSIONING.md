# Examination Model Versioning

When the examination `FormValues` model changes, persisted data (backend + localStorage) may no longer pass zod validation. The versioning system transforms old data to the current shape **before** validation, preventing silent data loss.

## Files

- `model-versioning.ts` — versioning engine, version constant, migration functions
- `validate-persistence.ts` — `migrateAndParseExaminationData()` wires migration into the load path
- `model-versioning.test.ts` — versioning engine tests

## When is a migration needed?

| Change | Migration? |
|---|---|
| Add new section (e11, e12...) | No — zod defaults fill it in |
| Add new field with a default value | No — zod defaults fill it in |
| Rename a field | **Yes** |
| Change a field's type | **Yes** |
| Restructure nested data | **Yes** |
| Remove a field | No — zod strips unknown keys |

## How to add a migration

1. Make the model change (e.g., rename field in `e1.model.ts`).

2. In `model-versioning.ts`, bump `CURRENT_MODEL_VERSION` and append a migration function:

```ts
export const CURRENT_MODEL_VERSION = 2;

export const migrations: Migration[] = [
  // v1 → v2: renamed e1.painLocation to e1.painSites
  (data) => {
    const e1 = data.e1 as Record<string, unknown> | undefined;
    if (e1?.painLocation !== undefined) {
      e1.painSites = e1.painLocation;
      delete e1.painLocation;
    }
    return data;
  },
];
```

3. Add a test in `model-versioning.test.ts` that verifies the transformation.

4. Run `pnpm --filter @cmdetect/frontend vitest run` to confirm tests pass.

No database migration is needed — the version is embedded inside `response_data` as `_modelVersion`.

## How it works

- The version is stored as `_modelVersion` inside `response_data` (jsonb) alongside the form fields. Zod strips it during validation, so it never enters the form state.
- On save (backend + localStorage), `_modelVersion: CURRENT_MODEL_VERSION` is spread into the data.
- On load, `migrateAndParseExaminationData()` extracts `_modelVersion` from the raw data, runs the migration chain, then validates with zod.
- Migrations apply sequentially: v1→v2→v3→...→current.
- Data without `_modelVersion` (legacy) is treated as v1.
- A runtime invariant enforces `CURRENT_MODEL_VERSION === migrations.length + 1` — forgetting a migration causes an immediate error.
