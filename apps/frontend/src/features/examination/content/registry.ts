/**
 * Type definitions for the content registry system.
 *
 * Uses ExhaustiveRecord to guarantee all semantic IDs have labels at compile time.
 * TypeScript will error if any key is missing from a label registry.
 */

import type { MeasurementId } from "../model/measurement";
import type { Movement } from "../model/movement";
import type { PainType } from "../model/pain";
import type { Region } from "../model/region";
import type { Side } from "../model/side";

// =============================================================================
// Core Types
// =============================================================================

/**
 * Ensures a Record has entries for ALL keys in union type K.
 * TypeScript will error if any key is missing.
 *
 * @example
 * type Colors = "red" | "blue" | "green";
 * const labels: ExhaustiveRecord<Colors, { text: string }> = {
 *   red: { text: "Red" },
 *   blue: { text: "Blue" },
 *   // TypeScript error: missing "green"
 * };
 */
export type ExhaustiveRecord<K extends string, V> = {
  readonly [P in K]: V;
};

/**
 * Base label type - all semantic content is just text for now.
 * Can be extended later for richer content (instructions, support text).
 */
export type Label = {
  readonly text: string;
};

// =============================================================================
// Category-Specific Label Types
// =============================================================================

/** Labels for pain types (pain, familiarPain, familiarHeadache, referred, spreading) */
export type PainTypeLabels = ExhaustiveRecord<PainType, Label>;

/** Labels for movements (maxUnassistedOpening, maxAssistedOpening, etc.) */
export type MovementLabels = ExhaustiveRecord<Movement, Label>;

/** Labels for measurement IDs (painFreeOpening, terminated) */
export type MeasurementLabels = ExhaustiveRecord<MeasurementId, Label>;

/** Labels for anatomical regions (temporalis, masseter, tmj, etc.) */
export type RegionLabels = ExhaustiveRecord<Region, Label>;

/** Labels for body sides (right, left) */
export type SideLabels = ExhaustiveRecord<Side, Label>;
