/**
 * Clinical Context for DC/TMD Diagnoses
 *
 * Provides ICD-10 codes, diagnostic validity (sensitivity/specificity),
 * clinical descriptions, and comments for each diagnosis.
 *
 * This data is purely for UI display and is kept separate from the
 * evaluation engine (DiagnosisDefinition). All data sourced from:
 * Schiffman E, et al. (2014) J Oral Facial Pain Headache, 28:6–27.
 */

import type { DiagnosisId } from "../ids/diagnosis";

// ── Types ─────────────────────────────────────────────────────────────

export interface DiagnosticValidity {
  /** Sensitivity (0–1), or null if not established */
  sensitivity: number | null;
  /** Specificity (0–1), or null if not established */
  specificity: number | null;
  /** Confidence level of the diagnostic criteria */
  level: "definitive" | "provisional" | "contentValidityOnly";
}

export interface DiagnosisClinicalContext {
  /** ICD-10 code */
  icd10: string;
  /** German description of the diagnosis */
  descriptionDE: string;
  /** Pre-formatted German validity summary */
  validityDE: string;
  /** Structured validity data */
  validity: DiagnosticValidity;
  /** Clinical comments in German */
  commentsDE: string[];
  /** Imaging recommendation in German, if applicable */
  imagingDE?: string;
}

// ── Registry ──────────────────────────────────────────────────────────

const CLINICAL_CONTEXT: Record<DiagnosisId, DiagnosisClinicalContext> = {
  myalgia: {
    icd10: "M79.1",
    descriptionDE:
      "Muskelschmerz, der durch Kieferbewegung, -funktion oder Parafunktion beeinflusst wird und durch Provokationstests der Kaumuskulatur reproduziert werden kann.",
    validityDE: "Sensitivität 0,90 · Spezifität 0,99",
    validity: { sensitivity: 0.9, specificity: 0.99, level: "definitive" },
    commentsDE: [
      "Der Schmerz wird nicht besser durch eine andere Schmerzdiagnose erklärt.",
    ],
  },

  localMyalgia: {
    icd10: "M79.1",
    descriptionDE:
      "Muskelschmerz wie bei Myalgie beschrieben, mit Schmerzlokalisation nur an der Palpationsstelle bei Verwendung des myofaszialen Untersuchungsprotokolls.",
    validityDE: "Sensitivität und Spezifität nicht bestimmt",
    validity: { sensitivity: null, specificity: null, level: "contentValidityOnly" },
    commentsDE: [
      "Der Schmerz wird nicht besser durch eine andere Schmerzdiagnose erklärt.",
    ],
  },

  myofascialPainWithSpreading: {
    icd10: "M79.1",
    descriptionDE:
      "Muskelschmerz wie bei Myalgie beschrieben, mit Schmerzausbreitung über die Palpationsstelle hinaus, aber innerhalb der Muskelgrenzen bei Verwendung des myofaszialen Untersuchungsprotokolls.",
    validityDE: "Sensitivität und Spezifität nicht bestimmt",
    validity: { sensitivity: null, specificity: null, level: "contentValidityOnly" },
    commentsDE: [
      "Der Schmerz wird nicht besser durch eine andere Schmerzdiagnose erklärt.",
    ],
  },

  myofascialPainWithReferral: {
    icd10: "M79.1",
    descriptionDE:
      "Muskelschmerz wie bei Myalgie beschrieben, mit Schmerzausstrahlung über die Muskelgrenzen hinaus bei Verwendung des myofaszialen Untersuchungsprotokolls. Schmerzausbreitung innerhalb des Muskels kann ebenfalls vorhanden sein.",
    validityDE: "Sensitivität 0,86 · Spezifität 0,98",
    validity: { sensitivity: 0.86, specificity: 0.98, level: "definitive" },
    commentsDE: [
      "Der Schmerz wird nicht besser durch eine andere Schmerzdiagnose erklärt.",
    ],
  },

  arthralgia: {
    icd10: "M26.62",
    descriptionDE:
      "Gelenkschmerz, der durch Kieferbewegung, -funktion oder Parafunktion beeinflusst wird und durch Provokationstests des Kiefergelenks reproduziert werden kann.",
    validityDE: "Sensitivität 0,89 · Spezifität 0,98",
    validity: { sensitivity: 0.89, specificity: 0.98, level: "definitive" },
    commentsDE: [
      "Der Schmerz wird nicht besser durch eine andere Schmerzdiagnose erklärt.",
    ],
  },

  headacheAttributedToTmd: {
    icd10: "G44.89",
    descriptionDE:
      "Kopfschmerz im Schläfenbereich, sekundär zu einer schmerzbezogenen CMD, der durch Kieferbewegung, -funktion oder Parafunktion beeinflusst wird und durch Provokationstests des Kausystems reproduziert werden kann.",
    validityDE: "Sensitivität 0,89 · Spezifität 0,87",
    validity: { sensitivity: 0.89, specificity: 0.87, level: "definitive" },
    commentsDE: [
      "Der Kopfschmerz wird nicht besser durch eine andere Kopfschmerzdiagnose erklärt.",
      "Eine Diagnose einer schmerzbezogenen CMD (z.\u00A0B. Myalgie oder Arthralgie) muss vorliegen.",
    ],
  },

  discDisplacementWithReduction: {
    icd10: "M26.63",
    descriptionDE:
      "Intraartikuläre biomechanische Störung des Kondylus-Diskus-Komplexes. Bei geschlossenem Mund befindet sich der Diskus in einer anterioren Position relativ zum Kondylus und reponiert bei Mundöffnung.",
    validityDE: "Sensitivität 0,34 · Spezifität 0,92 (ohne Bildgebung)",
    validity: { sensitivity: 0.34, specificity: 0.92, level: "provisional" },
    commentsDE: [
      "Klick-, Knack- oder Schnappgeräusche können bei der Diskusreposition auftreten.",
    ],
    imagingDE:
      "MRT des Kiefergelenks zur Bestätigung empfohlen. Bildgebung ist der Referenzstandard für diese Diagnose.",
  },

  discDisplacementWithReductionIntermittentLocking: {
    icd10: "M26.63",
    descriptionDE:
      "Intraartikuläre biomechanische Störung des Kondylus-Diskus-Komplexes mit intermittierender Reposition. Bei ausbleibender Reposition tritt eine intermittierende Mundöffnungseinschränkung auf.",
    validityDE: "Sensitivität 0,38 · Spezifität 0,98 (ohne Bildgebung)",
    validity: { sensitivity: 0.38, specificity: 0.98, level: "provisional" },
    commentsDE: [
      "Klick-, Knack- oder Schnappgeräusche können bei der Diskusreposition auftreten.",
      "Bei klinischem Vorliegen ist die Unfähigkeit, ohne Manöver normal zu öffnen, typisch.",
    ],
    imagingDE:
      "MRT des Kiefergelenks zur Bestätigung empfohlen. Bildgebung ist der Referenzstandard für diese Diagnose.",
  },

  discDisplacementWithoutReductionLimitedOpening: {
    icd10: "M26.63",
    descriptionDE:
      "Intraartikuläre biomechanische Störung des Kondylus-Diskus-Komplexes. Der Diskus reponiert nicht bei Mundöffnung. Verbunden mit einer anhaltenden Mundöffnungseinschränkung (auch \u201EClosed Lock\u201C genannt).",
    validityDE: "Sensitivität 0,80 · Spezifität 0,97 (ohne Bildgebung)",
    validity: { sensitivity: 0.8, specificity: 0.97, level: "definitive" },
    commentsDE: [
      "Kiefergelenkgeräusche (z.\u00A0B. Klicken bei Öffnung) schließen diese Diagnose nicht aus.",
    ],
    imagingDE:
      "MRT des Kiefergelenks zur Bestätigung empfohlen. Bildgebung ist der Referenzstandard für diese Diagnose.",
  },

  discDisplacementWithoutReductionWithoutLimitedOpening: {
    icd10: "M26.63",
    descriptionDE:
      "Intraartikuläre biomechanische Störung des Kondylus-Diskus-Komplexes. Der Diskus reponiert nicht bei Mundöffnung. Diese Störung ist NICHT mit einer aktuellen Mundöffnungseinschränkung verbunden.",
    validityDE: "Sensitivität 0,54 · Spezifität 0,79 (ohne Bildgebung)",
    validity: { sensitivity: 0.54, specificity: 0.79, level: "provisional" },
    commentsDE: [
      "Kiefergelenkgeräusche (z.\u00A0B. Klicken bei Öffnung) schließen diese Diagnose nicht aus.",
    ],
    imagingDE:
      "MRT des Kiefergelenks zur Bestätigung empfohlen. Bildgebung ist der Referenzstandard für diese Diagnose.",
  },

  degenerativeJointDisease: {
    icd10: "M19.91",
    descriptionDE:
      "Degenerative Erkrankung des Kiefergelenks, gekennzeichnet durch Verschleiß des Gelenkgewebes mit begleitenden knöchernen Veränderungen am Kondylus und/oder der Eminentia articularis.",
    validityDE: "Sensitivität 0,55 · Spezifität 0,61 (ohne Bildgebung)",
    validity: { sensitivity: 0.55, specificity: 0.61, level: "provisional" },
    commentsDE: [
      "Abflachung und/oder kortikale Sklerose gelten als unbestimmte Befunde und können normale Variation, Alterung oder Remodeling darstellen.",
    ],
    imagingDE:
      "CT des Kiefergelenks zur Bestätigung empfohlen. CT-Kriterien: subchondrale Zysten, Erosionen, generalisierte Sklerose oder Osteophyten.",
  },

  subluxation: {
    icd10: "S03.0XXA",
    descriptionDE:
      "Hypermobilitätsstörung des Diskus-Kondylus-Komplexes und der Eminentia articularis. In der offenen Mundposition befindet sich der Diskus-Kondylus-Komplex anterior der Eminentia articularis und kann nicht ohne Manipulationsmanöver in die normale Position zurückkehren.",
    validityDE: "Sensitivität 0,98 · Spezifität 1,00 (nur auf Anamnese basierend)",
    validity: { sensitivity: 0.98, specificity: 1.0, level: "definitive" },
    commentsDE: [
      "Die Diagnose basiert ausschließlich auf der Anamnese; klinische Untersuchungsbefunde sind nicht erforderlich.",
    ],
  },
};

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Get clinical context for a specific DC/TMD diagnosis.
 */
export function getDiagnosisClinicalContext(
  id: DiagnosisId
): DiagnosisClinicalContext {
  return CLINICAL_CONTEXT[id];
}
