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

  // Region labels
  temporalis: "Temporalis",
  masseter: "Masseter",
  tmj: "TMJ",
  otherMast: "Andere Kaumusk.",
  nonMast: "Nicht-Kaumusk.",

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
