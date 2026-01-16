// Label translations for examination fields
const LABELS: Record<string, string> = {
  // Measurement labels
  painFreeOpening: "Schmerzfreie Öffnung",
  maxUnassistedOpening: "Maximale Öffnung (unassistiert)",
  maxAssistedOpening: "Maximale Öffnung (assistiert)",
  terminated: "Abgebrochen",

  // Pain question labels
  pain: "Schmerz",
  familiarPain: "Bekannter Schmerz",
  familiarHeadache: "Bekannte Kopfschmerzen",
  referredPain: "Übertragener Schmerz",
  spreadingPain: "Ausbreitender Schmerz",

  // E4 Region labels
  temporalis: "Temporalis",
  masseter: "Masseter",
  tmj: "TMJ",
  otherMast: "Andere Kaumusk.",
  nonMast: "Nicht-Kaumusk.",

  // E9 Palpation site labels
  temporalisPosterior: "Temporalis (posterior)",
  temporalisMiddle: "Temporalis (mitte)",
  temporalisAnterior: "Temporalis (anterior)",
  masseterOrigin: "Masseter (Ursprung)",
  masseterBody: "Masseter (Körper)",
  masseterInsertion: "Masseter (Ansatz)",
  tmjLateralPole: "TMJ (lateraler Pol)",
  tmjAroundLateralPole: "TMJ (um lateralen Pol)",

  // E9 Muscle group labels
  temporalisMuscleGroup: "Temporalis",
  masseterMuscleGroup: "Masseter",
  tmjMuscleGroup: "Kiefergelenk (TMJ)",

  // Side labels
  left: "Links",
  right: "Rechts",
};

export const getLabel = (key?: string): string | undefined =>
  key ? LABELS[key] ?? key : undefined;

export const getSideLabel = (side: string): string =>
  LABELS[side] ?? side;

export const getRegionLabel = (region: string): string =>
  LABELS[region] ?? region;

export const getPainTypeLabel = (painType: string): string =>
  LABELS[painType] ?? painType;

export const getPalpationSiteLabel = (site: string): string =>
  LABELS[site] ?? site;

export const getMuscleGroupLabel = (muscleGroup: string): string =>
  LABELS[`${muscleGroup}MuscleGroup`] ?? muscleGroup;
