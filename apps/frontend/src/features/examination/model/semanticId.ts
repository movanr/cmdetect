/**
 * SemanticId - Type-safe union of all valid semantic identifiers.
 *
 * Semantic IDs are stable identifiers used for:
 * - Content lookup (i18n labels)
 * - Diagnostic meaning / clinical rules
 * - Analytics and reporting
 *
 * By using a union type instead of `string`, we get:
 * - Compile-time validation
 * - Autocomplete in editors
 * - Refactoring safety
 */

import type { MeasurementId } from "./measurement";
import type { Movement } from "./movement";
import type { PainType } from "./pain";

/**
 * Union of all valid semantic IDs used in examination questions.
 *
 * Includes:
 * - PainType: pain, familiarPain, familiarHeadache, referred, spreading
 * - Movement: maxUnassistedOpening, maxAssistedOpening, etc. (used as measurement IDs)
 * - MeasurementId: painFreeOpening, terminated
 */
export type SemanticId = PainType | Movement | MeasurementId;
