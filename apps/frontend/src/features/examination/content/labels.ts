import { MOVEMENTS } from "../model/movement";
import { PAIN_TYPES } from "../model/pain";
import { REGIONS } from "../model/region";
import { SIDES } from "../model/side";

type LabelEntry = {
  text: string;
  description?: string;
};

/**
 * Labels for examination questions, keyed by semanticId.
 * Used by the adapter layer to resolve display text.
 */
export const EXAMINATION_LABELS: Record<string, LabelEntry> = {
  // Measurements (E4)
  painFreeOpening: {
    text: "Schmerzfreie Mundöffnung",
    description: "Messung bis zum Schmerzpunkt",
  },
  maxUnassistedOpening: {
    text: "Maximale unassistierte Mundöffnung",
  },
  maxAssistedOpening: {
    text: "Maximale assistierte Mundöffnung",
  },
  terminated: {
    text: "Abgebrochen",
    description: "Patient hat die Untersuchung abgebrochen",
  },

  // Pain types
  [PAIN_TYPES.PAIN]: { text: "Schmerz" },
  [PAIN_TYPES.FAMILIAR]: { text: "Bekannter Schmerz" },
  [PAIN_TYPES.FAMILIAR_HEADACHE]: { text: "Bekannter Kopfschmerz" },
  [PAIN_TYPES.REFERRED]: { text: "Ausstrahlend" },
  [PAIN_TYPES.SPREADING]: { text: "Ausbreitend" },
};

/**
 * Labels for anatomical regions.
 */
export const REGION_LABELS: Record<string, string> = {
  // General regions (E4)
  [REGIONS.TEMPORALIS]: "Temporalis",
  [REGIONS.MASSETER]: "Masseter",
  [REGIONS.TMJ]: "Kiefergelenk",
  [REGIONS.OTHER_MAST]: "Andere Kaumuskeln",
  [REGIONS.NON_MAST]: "Nicht-Kaumuskulatur",
  // Temporalis zones (E9)
  [REGIONS.TEMPORALIS_POST]: "Posterior",
  [REGIONS.TEMPORALIS_MEDIA]: "Medial",
  [REGIONS.TEMPORALIS_ANT]: "Anterior",
  // Masseter zones (E9)
  [REGIONS.MASSETER_ORIGIN]: "Ursprung",
  [REGIONS.MASSETER_BODY]: "Bauch",
  [REGIONS.MASSETER_INSERTION]: "Ansatz",
  // TMJ zones (E9)
  [REGIONS.TMJ_LATERAL_POLE]: "Lateraler Pol",
  [REGIONS.TMJ_AROUND_LATERAL_POLE]: "Um den lateralen Pol",
};

/**
 * Labels for body sides.
 */
export const SIDE_LABELS: Record<string, string> = {
  [SIDES.RIGHT]: "Rechts",
  [SIDES.LEFT]: "Links",
};

/**
 * Labels for movements (E4, E5).
 */
export const MOVEMENT_LABELS: Record<string, string> = {
  [MOVEMENTS.MAX_UNASSISTED_OPENING]: "Maximale unassistierte Öffnung",
  [MOVEMENTS.MAX_ASSISTED_OPENING]: "Maximale assistierte Öffnung",
  [MOVEMENTS.RIGHT_LATERAL]: "Rechte Lateralbewegung",
  [MOVEMENTS.LEFT_LATERAL]: "Linke Lateralbewegung",
  [MOVEMENTS.PROTRUSION]: "Protrusion",
};

/**
 * Section labels for the examination form.
 */
export const SECTION_LABELS = {
  E4: "E4 - Öffnungsbewegungen",
  E5: "E5 - Lateral- und Protrusionsbewegungen",
  E9: "E9 - Muskel- und Kiefergelenk-Palpation",
} as const;
