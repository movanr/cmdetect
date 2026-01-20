/**
 * Pain Drawing Evaluation Types
 * Following DC/TMD specification for pain area documentation and scoring
 */

// Drawing element types
export type DrawingTool = "shade" | "point" | "arrow";

export type ImageId =
  | "mouth"
  | "head-right"
  | "head-left"
  | "body-front"
  | "body-back";

export interface ShadingStroke {
  id: string;
  type: "shade";
  points: number[]; // [x1, y1, x2, y2, ...]
}

export interface PointMarker {
  id: string;
  type: "point";
  x: number;
  y: number;
}

export interface ArrowMarker {
  id: string;
  type: "arrow";
  points: [number, number, number, number]; // [x1, y1, x2, y2]
}

export type DrawingElement = ShadingStroke | PointMarker | ArrowMarker;

export interface ImageDrawingData {
  imageId: ImageId;
  elements: DrawingElement[];
}

export interface PainDrawingData {
  drawings: Record<ImageId, ImageDrawingData>;
  completedAt: string;
  version: "1.0";
}

export interface ImageConfig {
  id: ImageId;
  src: string;
  label: string; // German only
  aspectRatio: number; // height / width
  mirror?: boolean; // horizontally flip the image
}

export interface CanvasSize {
  width: number;
  height: number;
  scale: number;
}

// Scoring types
export type RiskLevel = "none" | "localized" | "regional" | "widespread";

export interface ElementCounts {
  shadings: number;
  points: number;
  arrows: number;
  total: number;
}

export interface PainPatterns {
  hasHeadPain: boolean;
  hasOralPain: boolean;
  hasBodyPain: boolean;
  hasWidespreadPain: boolean; // 3+ regions
}

export interface PainInterpretation {
  label: string; // German only
  description: string; // German only
}

export interface PainDrawingScore {
  regionCount: number; // 0-5
  affectedRegions: ImageId[];
  elementCounts: Record<ImageId, ElementCounts>;
  totalElements: number;
  patterns: PainPatterns;
  riskLevel: RiskLevel;
  interpretation: PainInterpretation;
}

// Severity segment for UI display
export interface SeveritySegment {
  label: string; // Display label (e.g., "0", "≥1")
  min: number;
  max: number;
  color: string;
  riskLevel: RiskLevel;
}
