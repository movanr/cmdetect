// Main component
export { PainDrawingWizard } from './PainDrawingWizard';

// Sub-components (for advanced usage)
export { PainDrawingCanvas } from './PainDrawingCanvas';
export { DrawingToolbar } from './DrawingToolbar';
export { ImageStep } from './ImageStep';
export { InstructionStep } from './InstructionStep';
export { ReviewStep } from './ReviewStep';

// Hooks
export { usePainDrawing } from './hooks/usePainDrawing';
export { useDrawingHistory } from './hooks/useDrawingHistory';
export { useCanvasExport } from './hooks/useCanvasExport';

// Types
export type {
  DrawingTool,
  ImageId,
  ShadingStroke,
  PointMarker,
  ArrowMarker,
  DrawingElement,
  ImageDrawingData,
  PainDrawingData,
  ImageConfig,
  CanvasSize,
  WizardStep,
} from './types';

// Constants
export {
  DRAWING_STYLES,
  CANVAS_CONFIG,
  IMAGE_CONFIGS,
  WIZARD_STEPS,
  INSTRUCTION_TEXT,
  TOOL_LABELS,
} from './constants';
