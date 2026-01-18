import type { ImageConfig, ImageId, WizardStep } from "./types";

/**
 * Drawing tool colors and styles
 */
export const DRAWING_STYLES = {
  shade: {
    stroke: "#dc2626", // red-600
    strokeWidth: 24,
    opacity: 0.5,
    lineCap: "round" as const,
    lineJoin: "round" as const,
    tension: 0.5,
  },
  point: {
    fill: "#dc2626", // red-600
    radius: 12,
  },
  arrow: {
    stroke: "#dc2626", // red-600
    strokeWidth: 4,
    fill: "#dc2626",
    pointerLength: 16,
    pointerWidth: 14,
  },
} as const;

/**
 * Canvas configuration
 */
export const CANVAS_CONFIG = {
  maxWidth: 500, // Maximum canvas width in pixels
  minWidth: 280, // Minimum canvas width in pixels
  padding: 16, // Padding around canvas
} as const;

/**
 * Image configurations for each body part
 * aspectRatio = height / width (calculated from actual images)
 */
export const IMAGE_CONFIGS: Record<ImageId, ImageConfig> = {
  mouth: {
    id: "mouth",
    src: "/images/pain-drawing/mouth.jpeg",
    label: "Mund und Zaehne",
    aspectRatio: 1.608, // 849 / 528
  },
  "head-right": {
    id: "head-right",
    src: "/images/pain-drawing/head-left.png", // Mirrored version of head-left
    label: "Gesicht rechts",
    aspectRatio: 1.356, // Same as head-left
    mirror: true,
  },
  "head-left": {
    id: "head-left",
    src: "/images/pain-drawing/head-left.png",
    label: "Gesicht links",
    aspectRatio: 1.356, // 1601 / 1181
  },
  "body-front": {
    id: "body-front",
    src: "/images/pain-drawing/body-front.png",
    label: "Koerper Vorderseite",
    aspectRatio: 1.905, // 1579 / 829
  },
  "body-back": {
    id: "body-back",
    src: "/images/pain-drawing/body-back.png",
    label: "Koerper Rueckseite",
    aspectRatio: 1.905, // 1579 / 829
  },
};

/**
 * Wizard step configuration
 */
export const WIZARD_STEPS: WizardStep[] = [
  {
    type: "instruction",
    title: "Anleitung",
  },
  {
    type: "drawing",
    imageId: "head-right",
    title: "Gesicht rechts",
  },
  {
    type: "drawing",
    imageId: "head-left",
    title: "Gesicht links",
  },
  {
    type: "drawing",
    imageId: "mouth",
    title: "Mund und Zaehne",
  },
  {
    type: "drawing",
    imageId: "body-front",
    title: "Koerper Vorderseite",
  },
  {
    type: "drawing",
    imageId: "body-back",
    title: "Koerper Rueckseite",
  },
  {
    type: "review",
    title: "Überprüfung",
  },
];

/**
 * DC/TMD Instruction text (German)
 */
export const INSTRUCTION_TEXT = {
  title: "Schmerzzeichnung",
  paragraphs: [
    "Bitte zeichnen Sie auf den folgenden Bildern ein, wo Sie Schmerzen haben.",
    "Verwenden Sie die Werkzeuge unten, um Ihre Schmerzen zu markieren:",
  ],
  tools: [
    {
      name: "Schattieren",
      description: "Markieren Sie Schmerzbereiche durch Ausmalen",
    },
    {
      name: "Punkt",
      description: "Setzen Sie einen Punkt fuer praezise Schmerzstellen",
    },
    {
      name: "Pfeil",
      description: "Zeigen Sie die Richtung von ausstrahlenden Schmerzen",
    },
  ],
  footer: 'Tippen Sie auf "Weiter" um zu beginnen.',
} as const;

/**
 * Tool labels for toolbar
 */
export const TOOL_LABELS = {
  shade: "Schattieren",
  point: "Punkt",
  arrow: "Pfeil",
  undo: "Rueckgaengig",
  redo: "Wiederholen",
  clear: "Loeschen",
} as const;
