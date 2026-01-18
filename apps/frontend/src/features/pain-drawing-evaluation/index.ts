/**
 * Pain Drawing Evaluation Feature
 *
 * Provides components and utilities for displaying and scoring
 * patient-submitted pain drawings following DC/TMD specifications.
 */

// Types
export type {
  ImageId,
  DrawingElement,
  ShadingStroke,
  PointMarker,
  ArrowMarker,
  PainDrawingData,
  PainDrawingScore,
  RiskLevel,
  ElementCounts,
  PainPatterns,
  ImageConfig,
  CanvasSize,
} from "./types";

// Components
export { PainDrawingScoreCard } from "./components/PainDrawingScoreCard";
export { PainDrawingViewer } from "./components/PainDrawingViewer";
export { ReadOnlyCanvas } from "./components/ReadOnlyCanvas";
export { RegionThumbnail } from "./components/RegionThumbnail";

// Scoring
export {
  calculatePainDrawingScore,
  hasDrawings,
  getScoreSummary,
} from "./scoring/calculatePainScore";

// Constants
export {
  IMAGE_CONFIGS,
  REGION_ORDER,
  SEVERITY_SEGMENTS,
  DRAWING_STYLES,
  RISK_INTERPRETATIONS,
} from "./constants";
