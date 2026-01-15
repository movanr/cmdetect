/**
 * Type-safe labels for examination content.
 *
 * Uses `satisfies` to guarantee all entries in each union type have labels.
 * TypeScript will error at compile time if any ID is missing.
 *
 * All label access goes through the unified `getLabel()` function.
 */

import { MEASUREMENT_IDS, type MeasurementId } from "../model/measurement";
import { MOVEMENTS, type Movement } from "../model/movement";
import { PAIN_TYPES, type PainType } from "../model/pain";
import { REGIONS, type Region } from "../model/region";
import type { SemanticId } from "../model/semanticId";
import { SIDES, type Side } from "../model/side";
import type {
  MeasurementLabels,
  MovementLabels,
  PainTypeLabels,
  RegionLabels,
  SideLabels,
} from "./registry";

// =============================================================================
// Label Registries (internal - use getLabel())
// =============================================================================

const PAIN_LABELS = {
  [PAIN_TYPES.PAIN]: { text: "Schmerz" },
  [PAIN_TYPES.FAMILIAR]: { text: "Bekannter Schmerz" },
  [PAIN_TYPES.FAMILIAR_HEADACHE]: { text: "Bekannter Kopfschmerz" },
  [PAIN_TYPES.REFERRED]: { text: "Übertragener Schmerz" },
  [PAIN_TYPES.SPREADING]: { text: "Ausbreitender Schmerz" },
} as const satisfies PainTypeLabels;

const MOVEMENT_LABELS = {
  [MOVEMENTS.MAX_UNASSISTED_OPENING]: { text: "Maximale aktive Mundöffnung" },
  [MOVEMENTS.MAX_ASSISTED_OPENING]: { text: "Maximale passive Mundöffnung" },
  [MOVEMENTS.RIGHT_LATERAL]: { text: "Laterotrusion nach rechts" },
  [MOVEMENTS.LEFT_LATERAL]: { text: "Laterotrusion nach links" },
  [MOVEMENTS.PROTRUSION]: { text: "Protrusion" },
} as const satisfies MovementLabels;

const MEASUREMENT_LABELS = {
  [MEASUREMENT_IDS.PAIN_FREE_OPENING]: { text: "Schmerzfreie Mundöffnung" },
  [MEASUREMENT_IDS.TERMINATED]: { text: "Abgebrochen" },
} as const satisfies MeasurementLabels;

const REGION_LABELS = {
  // General regions (E4)
  [REGIONS.TEMPORALIS]: { text: "Temporalis" },
  [REGIONS.MASSETER]: { text: "Masseter" },
  [REGIONS.TMJ]: { text: "Kiefergelenk" },
  [REGIONS.OTHER_MAST]: { text: "Andere Kaumuskeln" },
  [REGIONS.NON_MAST]: { text: "Nicht-mastik. Muskeln" },
  // Temporalis zones (E9)
  [REGIONS.TEMPORALIS_POST]: { text: "Posterior" },
  [REGIONS.TEMPORALIS_MEDIA]: { text: "Media" },
  [REGIONS.TEMPORALIS_ANT]: { text: "Anterior" },
  // Masseter zones (E9)
  [REGIONS.MASSETER_ORIGIN]: { text: "Ursprung" },
  [REGIONS.MASSETER_BODY]: { text: "Körper" },
  [REGIONS.MASSETER_INSERTION]: { text: "Ansatz" },
  // TMJ zones (E9)
  [REGIONS.TMJ_LATERAL_POLE]: { text: "Lateraler Pol" },
  [REGIONS.TMJ_AROUND_LATERAL_POLE]: { text: "Um den lateralen Pol" },
} as const satisfies RegionLabels;

const SIDE_LABELS = {
  [SIDES.RIGHT]: { text: "Rechte Seite" },
  [SIDES.LEFT]: { text: "Linke Seite" },
} as const satisfies SideLabels;

// =============================================================================
// Section Labels (not IDs - exported directly)
// =============================================================================

export const SECTION_LABELS = {
  E4: "U4 - Öffnungs- und Schließbewegungen",
  E5: "U5 - Laterotrusion und Protrusion",
  E9: "U9 - Muskel- und Kiefergelenkschmerzen bei Palpation",
} as const;

// =============================================================================
// Unified Label Type
// =============================================================================

/**
 * Union of all types that have labels.
 * Used by the unified getLabel() function.
 */
export type LabelId = SemanticId | Region | Side;

// =============================================================================
// Type Guards
// =============================================================================

function isPainType(id: LabelId): id is PainType {
  return id in PAIN_LABELS;
}

function isMovement(id: LabelId): id is Movement {
  return id in MOVEMENT_LABELS;
}

function isMeasurementId(id: LabelId): id is MeasurementId {
  return id in MEASUREMENT_LABELS;
}

function isRegion(id: LabelId): id is Region {
  return id in REGION_LABELS;
}

function isSide(id: LabelId): id is Side {
  return id in SIDE_LABELS;
}

// =============================================================================
// Unified Label Getter
// =============================================================================

/**
 * Get the display label for any ID type.
 *
 * Handles: PainType, Movement, MeasurementId, Region, Side
 *
 * @example
 * getLabel("pain")        // "Schmerz"
 * getLabel("temporalis")  // "Temporalis"
 * getLabel("right")       // "Rechte Seite"
 */
export function getLabel(id: LabelId): string {
  if (isPainType(id)) return PAIN_LABELS[id].text;
  if (isMovement(id)) return MOVEMENT_LABELS[id].text;
  if (isMeasurementId(id)) return MEASUREMENT_LABELS[id].text;
  if (isRegion(id)) return REGION_LABELS[id].text;
  if (isSide(id)) return SIDE_LABELS[id].text;
  // Exhaustiveness check - TypeScript ensures this is unreachable
  const _exhaustive: never = id;
  throw new Error(`Unknown label ID: ${_exhaustive}`);
}
