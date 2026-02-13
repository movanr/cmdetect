import type { ImageConfig, ImageId, WizardStep } from "./types";

/**
 * Drawing tool colors and styles
 */
export const DRAWING_STYLES = {
  shade: {
    stroke: "#dc2626", // red-600
    strokeWidth: 16,
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
    stroke: "#1d4ed8", // blue-700
    strokeWidth: 4,
    fill: "#1d4ed8", // blue-700
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
    label: "Mund und Zähne",
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
    label: "Körper Vorderseite",
    aspectRatio: 1.905, // 1579 / 829
  },
  "body-back": {
    id: "body-back",
    src: "/images/pain-drawing/body-back.png",
    label: "Körper Rückseite",
    aspectRatio: 1.905, // 1579 / 829
  },
};

/**
 * Wizard step configuration
 */
export const WIZARD_STEPS: WizardStep[] = [
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
    title: "Mund und Zähne",
  },
  {
    type: "drawing",
    imageId: "body-front",
    title: "Körper Vorderseite",
  },
  {
    type: "drawing",
    imageId: "body-back",
    title: "Körper Rückseite",
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
      name: "Schraffieren",
      description: "Schraffieren Sie alle Gebiete, in denen Sie unterschiedliche Schmerzen haben.",
    },
    {
      name: "Punkt",
      description:
        "Wenn es einen genauen Punkt gibt, wo der Schmerz lokalisiert ist, kennzeichnen Sie ihn mit einem ausgefüllten Punkt.",
    },
    {
      name: "Pfeil",
      description:
        "Wenn Ihr Schmerz von einem zu einem anderen Ort wandert, nutzen Sie Pfeile um den Weg aufzuzeigen.",
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
  undo: "Rückgängig",
  redo: "Wiederholen",
  clear: "Löschen",
} as const;
