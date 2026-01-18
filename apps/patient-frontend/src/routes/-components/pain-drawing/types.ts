/**
 * Pain Drawing Types
 * Following DC/TMD specification for pain area documentation
 */

export type DrawingTool = 'shade' | 'point' | 'arrow';

export type ImageId = 'mouth' | 'head-right' | 'head-left' | 'body-front' | 'body-back';

export interface ShadingStroke {
  id: string;
  type: 'shade';
  points: number[]; // [x1, y1, x2, y2, ...]
}

export interface PointMarker {
  id: string;
  type: 'point';
  x: number;
  y: number;
}

export interface ArrowMarker {
  id: string;
  type: 'arrow';
  points: [number, number, number, number]; // [x1, y1, x2, y2]
}

export type DrawingElement = ShadingStroke | PointMarker | ArrowMarker;

export interface ImageDrawingData {
  imageId: ImageId;
  elements: DrawingElement[];
  pngExport?: string; // base64
}

export interface PainDrawingData {
  drawings: Record<ImageId, ImageDrawingData>;
  completedAt: string;
  version: '1.0';
}

export interface ImageConfig {
  id: ImageId;
  src: string;
  label: string;
  aspectRatio: number; // height / width
  mirror?: boolean; // horizontally flip the image
}

export interface CanvasSize {
  width: number;
  height: number;
  scale: number;
}

export type HistoryAction =
  | { type: 'ADD'; element: DrawingElement }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' }
  | { type: 'SET'; elements: DrawingElement[] };

export interface HistoryState {
  past: DrawingElement[][];
  present: DrawingElement[];
  future: DrawingElement[][];
}

export interface WizardStep {
  type: 'instruction' | 'drawing' | 'review';
  imageId?: ImageId;
  title: string;
}
