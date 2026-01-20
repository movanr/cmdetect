import type { ImageConfig, ImageId, SeveritySegment } from "./types";

/**
 * Drawing tool colors and styles for rendering
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
  thumbnailWidth: 80, // Thumbnail width for grid view (compact)
} as const;

/**
 * Image configurations for each body part
 * aspectRatio = height / width (calculated from actual images)
 */
export const IMAGE_CONFIGS: Record<ImageId, ImageConfig> = {
  mouth: {
    id: "mouth",
    src: "/images/pain-drawing/mouth.jpeg",
    label: "Mund",
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
    label: "Vorderseite",
    aspectRatio: 1.905, // 1579 / 829
  },
  "body-back": {
    id: "body-back",
    src: "/images/pain-drawing/body-back.png",
    label: "Rückseite",
    aspectRatio: 1.905, // 1579 / 829
  },
};

/**
 * Order of regions for display (following DC/TMD order)
 */
export const REGION_ORDER: ImageId[] = [
  "head-right",
  "head-left",
  "mouth",
  "body-front",
  "body-back",
];

/**
 * Severity scale segments based on DC/TMD pain region count (0-5)
 * Higher region count correlates with chronic pain risk
 */
export const SEVERITY_SEGMENTS: SeveritySegment[] = [
  {
    label: "0",
    min: 0,
    max: 0,
    color: "bg-green-500",
    riskLevel: "none",
  },
  {
    label: "≥1",
    min: 1,
    max: 1,
    color: "bg-yellow-400",
    riskLevel: "localized",
  },
  {
    label: "≥2",
    min: 2,
    max: 2,
    color: "bg-yellow-500",
    riskLevel: "regional",
  },
  {
    label: "≥3",
    min: 3,
    max: 3,
    color: "bg-orange-500",
    riskLevel: "regional",
  },
  {
    label: "≥4",
    min: 4,
    max: 4,
    color: "bg-orange-600",
    riskLevel: "widespread",
  },
  {
    label: "≥5",
    min: 5,
    max: 5,
    color: "bg-red-500",
    riskLevel: "widespread",
  },
];

/**
 * Risk level interpretations (German only)
 */
export const RISK_INTERPRETATIONS = {
  none: {
    label: "Keine Schmerzangabe",
    description: "Patient hat keine Schmerzareale markiert.",
  },
  localized: {
    label: "Lokalisierter Schmerz",
    description: "Schmerz auf eine Region begrenzt.",
  },
  regional: {
    label: "Regionaler Schmerz",
    description: "Schmerz in mehreren benachbarten Regionen.",
  },
  widespread: {
    label: "Weitverbreiteter Schmerz",
    description:
      "Schmerz in vielen Körperbereichen. Erhöhtes Risiko für chronische Schmerzen.",
  },
} as const;

/**
 * Region category mapping for pattern detection
 */
export const REGION_CATEGORIES = {
  head: ["head-right", "head-left"] as ImageId[],
  oral: ["mouth"] as ImageId[],
  body: ["body-front", "body-back"] as ImageId[],
} as const;
